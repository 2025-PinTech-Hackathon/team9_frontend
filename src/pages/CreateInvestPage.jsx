import {
    Box,
    Container,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    HStack,
    Text,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    Radio,
    RadioGroup,
    Stack,
    useToast,
    Tooltip,
    InputGroup,
    InputRightAddon,
  } from "@chakra-ui/react";
  import { useEffect, useRef, useState } from "react";
  import { useNavigate, useSearchParams } from "react-router-dom";
  import FarmDetail from "../components/FarmDetail";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faCog } from "@fortawesome/free-solid-svg-icons";
  import { customFetch } from "../utils/fetch";
  import config from "../../config.json";
  import { useUser } from "../contexts/UserContext";
  import { motion, AnimatePresence } from "framer-motion";
  
  function CreateInvestPage()  {
    const canvasRef = useRef(null);
    const [searchParams] = useSearchParams();
    const investmentId = searchParams.get("id");
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { refetch } = useUser();
    const containerRef = useRef(null);

    const [investmentData, setInvestmentData] = useState({
      name: "",
      coinType: "",
      initialAmount: "",
      riskLevel: "medium",
    });
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          navigate("/main");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [navigate]);

    // 천 단위 구분 기호 적용 함수
    const formatAmount = (value) => {
      if (!value) return '';
      // 숫자만 추출
      const numbers = value.replace(/[^0-9]/g, '');
      // 천 단위 구분 기호 적용
      return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 숫자와 천 단위 구분 기호만 허용하는 함수
    const handleAmountChange = (e) => {
      const value = e.target.value;
      // 숫자와 콤마만 허용
      if (/^[0-9,]*$/.test(value)) {
        const numericValue = value.replace(/,/g, '');
        setInvestmentData(prev => ({...prev, initialAmount: numericValue}));
      }
    };
  
    const handleCreateInvestment = async () => {
      try {
        console.log(investmentData);
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        const response = await customFetch(`${config.hostname}/investments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: investmentData.name,
            coin_type: investmentData.coinType,
            initial_amount: parseFloat(investmentData.initialAmount.replace(/,/g, '')),
            risk_level: investmentData.riskLevel,
            internal_position: parseInt(investmentId),
            
          })
        });

        if (!response.ok) {
          throw new Error('투자 생성에 실패했습니다.');
        }

        await refetch();

        toast({
          title: "투자 생성 완료",
          description: "새로운 투자가 성공적으로 생성되었습니다.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate("/main");


      } catch (error) {
        toast({
          title: "에러 발생",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Container maxW="1024px" px={4} py={8}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Heading as="h1" mb={8} textAlign="center">
            새로운 투자 생성
          </Heading>

          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Box
              maxW="600px"
              mx="auto"
              p={10}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="lg"
              bg="white"
              mb={8}
              minH="500px"
            >
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>투자 이름</FormLabel>
                  <Input 
                    placeholder="투자 이름을 입력하세요" 
                    value={investmentData.name || ''}
                    onChange={(e) => setInvestmentData(prev => ({...prev, name: e.target.value}))}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>코인 종류</FormLabel>
                  <Select 
                    placeholder="코인을 선택하세요"
                    value={investmentData.coinType || ''}
                    onChange={(e) => setInvestmentData(prev => ({...prev, coinType: e.target.value}))}
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>초기 투자 금액</FormLabel>
                  <InputGroup size="md">
                    <Input 
                      placeholder="초기 투자 금액을 입력하세요"
                      value={formatAmount(investmentData.initialAmount)}
                      onChange={handleAmountChange}
                    />
                    <InputRightAddon children="원" />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>투자 성향</FormLabel>
                  <RadioGroup
                    value={investmentData.riskLevel}
                    onChange={(value) => setInvestmentData(prev => ({...prev, riskLevel: value}))}
                  >
                    <Stack direction="row" spacing={6} justify="center">
                      <Tooltip label="안정적인 수익을 추구하는 보수적인 투자 전략" placement="top">
                        <Radio value="low" colorScheme="green">안정</Radio>
                      </Tooltip>
                      <Tooltip label="적정한 위험과 수익을 추구하는 균형잡힌 투자 전략" placement="top">
                        <Radio value="medium" colorScheme="blue">보통</Radio>
                      </Tooltip>
                      <Tooltip label="높은 수익을 추구하는 공격적인 투자 전략" placement="top">
                        <Radio value="high" colorScheme="red">위험</Radio>
                      </Tooltip>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Button 
                  colorScheme="blue" 
                  size="lg" 
                  width="100%"
                  mt={4}
                  isLoading={isLoading}
                  onClick={handleCreateInvestment}
                >
                  투자 생성하기
                </Button>
              </VStack>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    );
  }
  
  export default CreateInvestPage;
  
