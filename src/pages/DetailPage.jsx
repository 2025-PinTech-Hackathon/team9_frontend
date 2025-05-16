import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  Text,
  Spinner,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  VStack,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  useColorModeValue,
  Image,
  InputGroup,
  InputRightAddon,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FarmDetail from "../components/FarmDetail";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { customFetch } from "../utils/fetch";
import config from "../../config.json";

function DetailPage() {
  const canvasRef = useRef(null);
  const [searchParams] = useSearchParams();
  const investmentId = searchParams.get("id");

  const [investmentData, setInvestmentData] = useState({
    startDate: "",
    duration: 0,
    riskLevel: 0,
    expectedReturn: 0,
    availableAmount: 0,
    coinInfo: {
      symbol: "BTC",
      name: "Bitcoin",
      currentPrice: 65000,
      priceChangePercent: 2.5,
      logoUrl: "",
    },
    priceHistory: [
      { time: '00:00', price: 64000 },
      { time: '04:00', price: 64500 },
      { time: '08:00', price: 65200 },
      { time: '12:00', price: 64800 },
      { time: '16:00', price: 65500 },
      { time: '20:00', price: 65000 },
    ]
  });

  const [exchangeRate, setExchangeRate] = useState(1300); // USD to KRW
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);

  const {
    isOpen: isDepositOpen,
    onOpen: onDepositOpen,
    onClose: onDepositClose,
  } = useDisclosure();

  const {
    isOpen: isWithdrawOpen,
    onOpen: onWithdrawOpen,
    onClose: onWithdrawClose,
  } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    const fetchInvestmentData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }
        const response = await customFetch(
          `${config.hostname}/investments/get_investment_by_position?internal_position=${investmentId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        console.log(data);
        setInvestmentData({
          id: data.data.id,
          startDate: data.data.created_at.split('T')[0],
          duration: Math.floor((new Date() - new Date(data.data.created_at)) / (1000 * 60 * 60 * 24)),
          riskLevel: data.data.risk_level === 'low' ? 1 : data.data.risk_level === 'medium' ? 2 : 3,
          expectedReturn: data.data.current_profit,
          availableAmount: data.data.initial_amount + data.data.current_profit,
          coinInfo: {
            symbol: data.data.coin_type,
            name: data.data.coin_type === 'BTC' ? 'Bitcoin' : data.data.coin_type === 'ETH' ? 'Ethereum' : 'Solana',
            currentPrice: data.data.entry_price_usdt,
            priceChangePercent: ((data.data.current_profit / data.data.initial_amount) * 100).toFixed(2),
            logoUrl: `/src/assets/coins/${data.data.coin_type.toLowerCase()}.svg`,
          },
          priceHistory: data.data.transactions.map(tx => ({
            time: new Date(tx.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            price: tx.amount
          }))
        });
      } catch (error) {
        console.error("투자 데이터를 가져오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (investmentId) {
      fetchInvestmentData();
    }
  }, [investmentId]);

  const getRiskLevelInfo = (level) => {
    const levels = {
      1: { 
        label: '안전', 
        color: 'green.400', 
        description: '안정적인 투자 전략',
        gradient: 'linear(to-r, green.50, green.100)'
      },
      2: { 
        label: '중간', 
        color: 'orange.400', 
        description: '균형잡힌 투자 전략',
        gradient: 'linear(to-r, orange.50, orange.100)'
      },
      3: { 
        label: '위험', 
        color: 'red.400', 
        description: '공격적인 투자 전략',
        gradient: 'linear(to-r, red.50, red.100)'
      },
    };
    return levels[level] || levels[1];
  };

  // 천 단위 구분 기호 적용 함수
  const formatAmount = (value) => {
    if (!value) return '';
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');
    // 천 단위 구분 기호 적용
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 숫자와 천 단위 구분 기호만 허용하는 함수
  const handleAmountChange = (e, setAmount) => {
    const value = e.target.value;
    // 숫자와 콤마만 허용
    if (/^[0-9,]*$/.test(value)) {
      setAmount(value.replace(/,/g, '')); // 저장할 때는 콤마 제거
    }
  };

  // USD 변환 계산 함수
  const calculateUSD = (amount) => {
    if (!amount) return '0.00';
    const numericAmount = parseInt(amount.replace(/,/g, ''));
    return (numericAmount / exchangeRate).toFixed(2);
  };

  const handleDeposit = async () => {
    try {
      setIsDepositLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const numericAmount = parseInt(depositAmount.replace(/,/g, ''));
      if (!numericAmount || numericAmount <= 0) {
        throw new Error('유효한 금액을 입력해주세요.');
      }

      const response = await customFetch(
        `${config.hostname}/investments/${investmentData.id}/deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: numericAmount
          })
        }
      );

      if (!response.ok) {
        throw new Error('입금에 실패했습니다.');
      }

      toast({
        title: "입금 완료",
        description: `${formatAmount(depositAmount)}원이 성공적으로 입금되었습니다.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // 입금 후 데이터 새로고침
      const updatedResponse = await customFetch(
        `${config.hostname}/investments/get_investment_by_position?internal_position=${investmentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const updatedData = await updatedResponse.json();
      setInvestmentData({
        id: updatedData.data.id,
        startDate: updatedData.data.created_at.split('T')[0],
        duration: Math.floor((new Date() - new Date(updatedData.data.created_at)) / (1000 * 60 * 60 * 24)),
        riskLevel: updatedData.data.risk_level === 'low' ? 1 : updatedData.data.risk_level === 'medium' ? 2 : 3,
        expectedReturn: updatedData.data.current_profit,
        availableAmount: updatedData.data.initial_amount + updatedData.data.current_profit,
        coinInfo: {
          symbol: updatedData.data.coin_type,
          name: updatedData.data.coin_type === 'BTC' ? 'Bitcoin' : updatedData.data.coin_type === 'ETH' ? 'Ethereum' : 'Solana',
          currentPrice: updatedData.data.entry_price_usdt,
          priceChangePercent: ((updatedData.data.current_profit / updatedData.data.initial_amount) * 100).toFixed(2),
          logoUrl: `/src/assets/coins/${updatedData.data.coin_type.toLowerCase()}.svg`,
        },
        priceHistory: updatedData.data.transactions.map(tx => ({
          time: new Date(tx.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          price: tx.amount
        }))
      });

      onDepositClose();
      setDepositAmount('');
    } catch (error) {
      toast({
        title: "에러 발생",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const numericAmount = parseInt(withdrawAmount.replace(/,/g, ''));
      if (!numericAmount || numericAmount <= 0) {
        throw new Error('유효한 금액을 입력해주세요.');
      }

      if (numericAmount > investmentData.availableAmount) {
        throw new Error('출금 가능 금액을 초과했습니다.');
      }

      const response = await customFetch(
        `${config.hostname}/investments/${investmentData.id}/withdraw`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: numericAmount
          })
        }
      );

      if (!response.ok) {
        throw new Error('출금에 실패했습니다.');
      }

      toast({
        title: "출금 완료",
        description: `${formatAmount(withdrawAmount)}원이 성공적으로 출금되었습니다.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // 출금 후 데이터 새로고침
      const updatedResponse = await customFetch(
        `${config.hostname}/investments/get_investment_by_position?internal_position=${investmentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const updatedData = await updatedResponse.json();
      setInvestmentData({
        id: updatedData.data.id,
        startDate: updatedData.data.created_at.split('T')[0],
        duration: Math.floor((new Date() - new Date(updatedData.data.created_at)) / (1000 * 60 * 60 * 24)),
        riskLevel: updatedData.data.risk_level === 'low' ? 1 : updatedData.data.risk_level === 'medium' ? 2 : 3,
        expectedReturn: updatedData.data.current_profit,
        availableAmount: updatedData.data.initial_amount + updatedData.data.current_profit,
        coinInfo: {
          symbol: updatedData.data.coin_type,
          name: updatedData.data.coin_type === 'BTC' ? 'Bitcoin' : updatedData.data.coin_type === 'ETH' ? 'Ethereum' : 'Solana',
          currentPrice: updatedData.data.entry_price_usdt,
          priceChangePercent: ((updatedData.data.current_profit / updatedData.data.initial_amount) * 100).toFixed(2),
          logoUrl: `/src/assets/coins/${updatedData.data.coin_type.toLowerCase()}.svg`,
        },
        priceHistory: updatedData.data.transactions.map(tx => ({
          time: new Date(tx.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          price: tx.amount
        }))
      });

      onWithdrawClose();
      setWithdrawAmount('');
    } catch (error) {
      toast({
        title: "에러 발생",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  return (
    <Container maxW="1200px" px={6} py={10}>
      <VStack spacing={8} align="stretch">
        <Card 
          bg={useColorModeValue('green.50', 'green.900')}
          border="1px"
          borderColor="green.100"
          borderRadius="2xl"
          overflow="hidden"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            bgGradient: 'linear(to-r, green.300, green.500)'
          }}
        >
          <CardBody p={6}>
            <VStack spacing={6}>
              <Heading as="h1" fontSize="2xl" color="green.800">
                투자봇 상세 정보
      </Heading>
              <Text color="green.600" fontSize="lg" fontWeight="medium">
                #{investmentId}
              </Text>
            </VStack>
          </CardBody>
        </Card>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
            <Spinner 
              size="xl" 
              thickness="4px" 
              color="green.500"
              emptyColor="green.100"
              speed="0.8s"
            />
        </Box>
      ) : (
          <>
            {/* 코인 정보 카드 */}
            <Card
              bg={useColorModeValue('white', 'gray.800')}
              border="1px"
              borderColor="green.100"
              borderRadius="xl"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            >
              <CardBody>
                <HStack spacing={6} align="center">
                  <Image
                    src={investmentData.coinInfo.logoUrl}
                    alt={investmentData.coinInfo.symbol}
                    boxSize="48px"
                  />
                  <VStack align="start" flex={1}>
                    <HStack>
                      <Text fontSize="2xl" fontWeight="bold">
                        {investmentData.coinInfo.name}
                      </Text>
                      <Text color="gray.500">
                        {investmentData.coinInfo.symbol}
                      </Text>
                    </HStack>
                    <HStack spacing={4}>
                      <Text fontSize="xl" fontWeight="semibold">
                        ${investmentData.coinInfo.currentPrice.toLocaleString()}
                      </Text>
                      <Badge
                        colorScheme={investmentData.coinInfo.priceChangePercent >= 0 ? 'green' : 'red'}
                        fontSize="sm"
                        borderRadius="full"
                        px={2}
                      >
                        {investmentData.coinInfo.priceChangePercent >= 0 ? '+' : ''}
                        {investmentData.coinInfo.priceChangePercent}%
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* 가격 차트 */}
            <Card
              bg={useColorModeValue('white', 'gray.800')}
              border="1px"
              borderColor="green.100"
              borderRadius="xl"
              overflow="hidden"
              h="300px"
            >
              <CardBody>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={investmentData.priceHistory}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#38A169"
                      fill="#38A16933"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <Card
                bg={useColorModeValue('white', 'gray.800')}
                border="1px"
                borderColor="green.100"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="green.600" fontSize="sm">시작일</StatLabel>
                    <StatNumber fontSize="2xl" color="green.800" mt={2}>
                      {investmentData.startDate}
                    </StatNumber>
                    <StatHelpText color="green.500" fontSize="sm">
                      투자 시작 시점
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                bg={useColorModeValue('white', 'gray.800')}
                border="1px"
                borderColor="green.100"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="green.600" fontSize="sm">성장 기간</StatLabel>
                    <StatNumber fontSize="2xl" color="green.800" mt={2}>
                      {investmentData.duration}
                      <Text as="span" fontSize="lg" ml={1}>일</Text>
                    </StatNumber>
                    <StatHelpText color="green.500" fontSize="sm">
                      투자 진행 기간
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                bg={getRiskLevelInfo(investmentData.riskLevel).gradient}
                border="1px"
                borderColor={getRiskLevelInfo(investmentData.riskLevel).color}
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <Text color="gray.700" fontWeight="medium">투자 강도</Text>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        colorScheme={
                          investmentData.riskLevel === 3 ? 'red' :
                          investmentData.riskLevel === 2 ? 'orange' : 'green'
                        }
                        fontSize="sm"
                      >
                        {getRiskLevelInfo(investmentData.riskLevel).label}
                      </Badge>
                    </HStack>
                    <Box position="relative" w="100%">
                      <Box
                        w="100%"
                        h="8px"
                        bg="whiteAlpha.800"
                        borderRadius="full"
                        overflow="hidden"
                      >
                        <Box
                          h="100%"
                          w={`${(investmentData.riskLevel / 3) * 100}%`}
                          bg={getRiskLevelInfo(investmentData.riskLevel).color}
                          borderRadius="full"
                          transition="all 0.3s"
                        />
                      </Box>
                      <Text mt={2} fontSize="sm" color="gray.600">
                        {getRiskLevelInfo(investmentData.riskLevel).description}
                      </Text>
                </Box>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="green.50"
                border="1px"
                borderColor="green.200"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="green.700">예상 성장률</StatLabel>
                    <HStack align="baseline" mt={2}>
                      <StatNumber fontSize="3xl" color="green.600">
                        {investmentData.expectedReturn}
                      </StatNumber>
                      <Text color="green.600" fontSize="xl">%</Text>
                    </HStack>
                    <StatHelpText color="green.600">
                      연간 예상 수익
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card
                bg="white"
                border="1px"
                borderColor="green.100"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <CardBody>
                  <Stat>
                    <StatLabel color="green.700">수확 가능 금액</StatLabel>
                    <HStack align="baseline" mt={2}>
                      <StatNumber fontSize="3xl" color="green.600">
                        {investmentData.availableAmount.toLocaleString()}
                      </StatNumber>
                      <Text color="green.600" fontSize="xl">원</Text>
                    </HStack>
                    <StatHelpText color="green.600">
                      현재 출금 가능
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </>
        )}

        <HStack spacing={4} justify="center" mt={8}>
        <Button
            bg="green.500"
            color="white"
          size="lg"
            px={8}
            borderRadius="full"
            leftIcon={<Box as="span" fontSize="1.2em">🌱</Box>}
          onClick={onDepositOpen}
            _hover={{ bg: 'green.600', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
        >
            씨앗 심기
        </Button>
        <Button
            bg="orange.500"
            color="white"
          size="lg"
            px={8}
            borderRadius="full"
            leftIcon={<Box as="span" fontSize="1.2em">🌾</Box>}
          onClick={onWithdrawOpen}
            _hover={{ bg: 'orange.600', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            수확하기
        </Button>
      </HStack>
      </VStack>

      {/* 입금 모달 */}
      <Modal isOpen={isDepositOpen} onClose={onDepositClose} isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent
          borderRadius="2xl"
          bg="white"
          p={4}
        >
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor="green.100"
            color="green.800"
            pb={4}
          >
            <HStack>
              <Text fontSize="1.2em">🌱</Text>
              <Text>새로운 씨앗 심기</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            <VStack spacing={4}>
              <Text color="green.600">투자할 금액을 입력해주세요</Text>
              <VStack width="100%" spacing={1} align="stretch">
                <InputGroup size="lg">
                  <Input 
                    placeholder="0"
                    value={formatAmount(depositAmount)}
                    onChange={(e) => handleAmountChange(e, setDepositAmount)}
                    textAlign="right"
                    borderRadius="xl"
                    borderColor="green.200"
                    pr="4.5rem"
                    _focus={{
                      borderColor: "green.400",
                      boxShadow: "0 0 0 1px var(--chakra-colors-green-400)"
                    }}
                    _hover={{
                      borderColor: "green.300"
                    }}
                  />
                  <InputRightAddon 
                    children="KRW" 
                    bg="green.50" 
                    borderColor="green.200"
                    borderLeftWidth="0"
                    roundedRight="xl"
                  />
                </InputGroup>
                <HStack justify="space-between" px={2}>
                  <Text fontSize="sm" color="gray.500">예상 USD</Text>
                  <Text fontSize="sm" color="gray.500">
                    ≈ ${calculateUSD(depositAmount)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTopWidth="1px" 
            borderColor="green.100"
            pt={4}
          >
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onDepositClose}
              color="green.600"
              _hover={{ bg: 'green.50' }}
            >
              취소
            </Button>
            <Button 
              bg="green.500" 
              color="white" 
              _hover={{ bg: 'green.600' }}
              borderRadius="xl"
              isDisabled={!depositAmount}
              isLoading={isDepositLoading}
              onClick={handleDeposit}
            >
              {depositAmount ? `${formatAmount(depositAmount)} KRW 심기` : '심기'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 출금 모달 */}
      <Modal isOpen={isWithdrawOpen} onClose={onWithdrawClose} isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent
          borderRadius="2xl"
          bg="white"
          p={4}
        >
          <ModalHeader 
            borderBottomWidth="1px" 
            borderColor="orange.100"
            color="orange.800"
            pb={4}
          >
            <HStack>
              <Text fontSize="1.2em">🌾</Text>
              <Text>수확하기</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            <VStack spacing={4}>
              <Text color="orange.600">출금할 금액을 입력해주세요</Text>
              <VStack width="100%" spacing={1} align="stretch">
                <InputGroup size="lg">
                  <Input 
                    placeholder="0"
                    value={formatAmount(withdrawAmount)}
                    onChange={(e) => handleAmountChange(e, setWithdrawAmount)}
                    textAlign="right"
                    borderRadius="xl"
                    borderColor="orange.200"
                    pr="4.5rem"
                    _focus={{
                      borderColor: "orange.400",
                      boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)"
                    }}
                    _hover={{
                      borderColor: "orange.300"
                    }}
                  />
                  <InputRightAddon 
                    children="KRW" 
                    bg="orange.50" 
                    borderColor="orange.200"
                    borderLeftWidth="0"
                    roundedRight="xl"
                  />
                </InputGroup>
                <HStack justify="space-between" px={2}>
                  <Text fontSize="sm" color="gray.500">예상 USD</Text>
                  <Text fontSize="sm" color="gray.500">
                    ≈ ${calculateUSD(withdrawAmount)}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter 
            borderTopWidth="1px" 
            borderColor="orange.100"
            pt={4}
          >
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onWithdrawClose}
              color="orange.600"
              _hover={{ bg: 'orange.50' }}
            >
              취소
            </Button>
            <Button 
              bg="orange.500" 
              color="white" 
              _hover={{ bg: 'orange.600' }}
              borderRadius="xl"
              isDisabled={!withdrawAmount}
              isLoading={isWithdrawLoading}
              onClick={handleWithdraw}
            >
              {withdrawAmount ? `${formatAmount(withdrawAmount)} KRW 수확` : '수확하기'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default DetailPage;
