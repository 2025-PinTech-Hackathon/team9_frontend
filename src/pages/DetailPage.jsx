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
  Center,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import bigTreeImage from "../assets/farm/big_tree.png";
import littleTreeImage from "../assets/farm/little_tree.png";
import smallTreeImage from "../assets/farm/small_tree.png";
import { customFetch } from "../utils/fetch";
import config from "../../config.json";

function DetailPage() {
  const canvasRef = useRef(null);
  const [searchParams] = useSearchParams();
  const investmentId = searchParams.get("id");
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const [investmentData, setInvestmentData] = useState({
    startDate: "",
    duration: 0,
    riskLevel: 0,
    expectedReturn: 0,
    availableAmount: 0,
    name: "",
    coinInfo: {
      symbol: "BTC",
      name: "Bitcoin",
      currentPrice: 65000,
      priceChangePercent: 2.5,
      logoUrl: "",
    },
    priceHistory: []
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

        // 투자 금액 변화 데이터 생성
        const allTransactions = [
          ...data.data.transactions.map(tx => ({
            type: 'deposit',
            amount: tx.amount,
            created_at: tx.created_at,
            description: tx.description
          })),
          ...data.data.trade_history.map(trade => ({
            type: 'profit',
            amount: trade.profit_amount,
            created_at: trade.created_at,
            description: '거래 수익'
          }))
        ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        let currentAmount = 0;
        const priceHistory = allTransactions.map(tx => {
          if (tx.type === 'deposit') {
            currentAmount += tx.amount;
          } else if (tx.type === 'profit') {
            currentAmount += tx.amount;
          }
          return {
            time: new Date(tx.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            price: currentAmount,
            type: tx.type,
            description: tx.description,
            change: tx.amount
          };
        });

        setInvestmentData({
          id: data.data.id,
          name: data.data.name,
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
          priceHistory: priceHistory
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
        name: updatedData.data.name,
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
      const newInitialAmount = updatedData.data.initial_amount;
      setInvestmentData({
        id: updatedData.data.id,
        name: updatedData.data.name,
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

      // 출금 후 투자금이 0원이면 메인페이지로 이동
      if (newInitialAmount <= 0) {
        navigate('/main');
      }
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

  const handleBackgroundClick = (e) => {
    // 컨테이너를 클릭했을 때만 처리 (카드나 다른 요소 클릭은 무시)
    if (e.target === e.currentTarget) {
      setIsExiting(true);
      setTimeout(() => {
        navigate('/main');
      }, 500); // 애니메이션 시간과 동일하게 설정
    }
  };

  // 수익률 또는 투자금액에 따른 나무 이미지 선택 함수
  const getTreeImage = () => {
    if (!investmentData || !investmentData.coinInfo) return littleTreeImage;
    
    const profitRate = parseFloat(investmentData.coinInfo.priceChangePercent);
    const investmentAmount = investmentData.availableAmount;
    
    if (profitRate < 10 && investmentAmount < 200000) {
      return littleTreeImage;
    } else if ((profitRate >= 10 && profitRate < 20) || (investmentAmount >= 200000 && investmentAmount < 1000000)) {
      return smallTreeImage;
    } else {
      return bigTreeImage;
    }
  };

  return (
    <Container 
      maxW="1200px" 
      px={6} 
      py={10} 
      maxH="88vh" 
      overflowX="hidden" 
      overflowY="auto"
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent'
      }}
    >
      {isLoading ? (
        <Center h="500px">
          <Spinner size="xl" />
        </Center>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <VStack spacing={8} align="stretch">
            <Card>
              <CardBody>
                <VStack spacing={6}>
                  <Heading as="h1" fontSize="2xl" color="green.800">
                    {investmentData.name || "무명의 투자봇"}
                  </Heading>
                  <Center>
                    <Image
                      src={getTreeImage()}
                      alt="Investment Tree"
                      width="120px"
                      height="120px"
                      objectFit="contain"
                      style={{
                        transform: `scale(${(() => {
                          const amount = investmentData.availableAmount;
                          const profitRate = parseFloat(investmentData.coinInfo.priceChangePercent);
                          
                          // 수익률이나 투자금액 중 하나라도 큰 나무 조건을 만족하면 큰 나무 스케일 적용
                          if (profitRate >= 20 || amount >= 1000000) {
                            // 300만원 단위로 크기 증가, 최대 2배까지
                            const scaleByAmount = Math.min(1 + Math.floor((amount - 1000000) / 3000000) * 0.3, 2);
                            // 수익률 10% 단위로 크기 증가, 최대 2배까지
                            const scaleByProfit = Math.min(1 + Math.floor((profitRate - 20) / 10) * 0.3, 2);
                            // 둘 중 더 큰 값 사용
                            return Math.max(scaleByAmount, scaleByProfit);
                          } else if ((profitRate >= 10 && profitRate < 20) || (amount >= 200000 && amount < 1000000)) {
                            return 0.85; // 중간 나무 크기
                          } else {
                            return 0.7; // 기본 작은 나무 크기
                          }
                        })()})`
                      }}
                    />
                  </Center>
                </VStack>
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
                    <RechartsTooltip 
                      formatter={(value, name, props) => {
                        const data = props.payload;
                        const changeType = data.type === 'deposit' ? '입금' : '거래 수익';
                        const changeAmount = data.change > 0 ? `+${data.change.toLocaleString()}` : data.change.toLocaleString();
                        return [
                          <div style={{ padding: '3px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                              {`${value.toLocaleString()} KRW`}
                            </div>
                            <div style={{ color: data.type === 'deposit' ? '#38A169' : '#3182CE', marginBottom: '5px' }}>
                              {`${changeType}: ${changeAmount} KRW`}
                            </div>
                          </div>,
                          '투자 금액'
                        ];
                      }}
                      labelFormatter={(label) => `시간: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '8px'
                      }}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#38A169"
                        fill="#38A16933"
                        name="투자 금액"
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
                        {Number(investmentData.expectedReturn).toFixed(2)}
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
                        {Number(investmentData.availableAmount).toFixed(2)}
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
                  나무에 물주기
              </Button>
              <Button
                  bg="red.400"
                  color="white"
                  size="lg"
                  px={8}
                  borderRadius="full"
                  leftIcon={<Box as="span" fontSize="1.2em">🍎</Box>}
                  onClick={onWithdrawOpen}
                  _hover={{ bg: 'red.500', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
              >
                  열매 수확하기
              </Button>
            </HStack>
          </VStack>
        </motion.div>
      )}

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
              <Text>나무에 물주기</Text>
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
              borderColor="red.200"
              color="red.700"
              pb={4}
          >
            <HStack>
              <Text fontSize="1.2em">🍎</Text>
              <Text>열매 수확하기</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            <VStack spacing={4}>
              <Text color="red.600">출금할 금액을 입력해주세요</Text>
              <Text color="red.400" fontSize="sm" mt={-2}>
                모든 금액을 출금하면 해당 투자봇이 비활성화되어 사라집니다.
              </Text>
              <VStack width="100%" spacing={1} align="stretch">
                <InputGroup size="lg">
                  <Input
                      placeholder="0"
                      value={formatAmount(withdrawAmount)}
                      onChange={(e) => handleAmountChange(e, setWithdrawAmount)}
                      textAlign="right"
                      borderRadius="xl"
                      borderColor="red.200"
                      pr="4.5rem"
                      _focus={{
                        borderColor: "red.400",
                        boxShadow: "0 0 0 1px var(--chakra-colors-red-400)"
                      }}
                      _hover={{
                        borderColor: "red.300"
                      }}
                  />
                  <InputRightAddon
                      children="KRW"
                      bg="red.50"
                      borderColor="red.200"
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
              borderColor="red.200"
              pt={4}
          >
            <Button
                variant="ghost"
                mr={3}
                onClick={onWithdrawClose}
                color="red.600"
                _hover={{ bg: 'red.50' }}
            >
              취소
            </Button>
            <Button
                bg="red.400"
                color="white"
                _hover={{ bg: 'red.500' }}
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
