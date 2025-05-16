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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FarmDetail from "../components/FarmDetail";

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
  });

  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchInvestmentData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.example.com/investments/${investmentId}`
        );
        const data = await response.json();
        setInvestmentData({
          startDate: data.startDate,
          duration: data.duration,
          riskLevel: data.riskLevel,
          expectedReturn: data.expectedReturn,
          availableAmount: data.availableAmount,
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
              <Input 
                placeholder="금액을 입력하세요" 
                type="number" 
                size="lg"
                textAlign="right"
                borderRadius="xl"
                borderColor="green.200"
                _focus={{
                  borderColor: "green.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-green-400)"
                }}
                _hover={{
                  borderColor: "green.300"
                }}
              />
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
            >
              심기
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
              <Input 
                placeholder="금액을 입력하세요" 
                type="number" 
                size="lg"
                textAlign="right"
                borderRadius="xl"
                borderColor="orange.200"
                _focus={{
                  borderColor: "orange.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)"
                }}
                _hover={{
                  borderColor: "orange.300"
                }}
              />
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
            >
              수확하기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default DetailPage;
