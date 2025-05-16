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
  } from "@chakra-ui/react";
  import { useEffect, useRef, useState } from "react";
  import { useSearchParams } from "react-router-dom";
  import FarmDetail from "../components/FarmDetail";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faCog } from "@fortawesome/free-solid-svg-icons";
  import { customFetch } from "../utils/fetch";
  import config from "../../config.json";
  
  function CreateInvestPage()  {
    const canvasRef = useRef(null);
    const [searchParams] = useSearchParams();
    const investmentId = searchParams.get("id");
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
  
    const [investmentData, setInvestmentData] = useState({
      name: "",
      coinType: "",
      initialAmount: 0,
      riskPreference: "보통",
    });
  
    useEffect(() => {

    }, []);
  
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
            initial_amount: investmentData.initialAmount,
            entry_price_usdt: 0 // 현재는 0으로 설정, 실제 구현시 현재 코인 가격을 가져와서 설정
          })
        });

        if (!response.ok) {
          throw new Error('투자 생성에 실패했습니다.');
        }

        toast({
          title: "투자 생성 완료",
          description: "새로운 투자가 성공적으로 생성되었습니다.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        

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
        <Heading as="h1" mb={8} textAlign="center">
          새로운 투자 생성
        </Heading>

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
              <Input 
                type="number" 
                placeholder="초기 투자 금액을 입력하세요"
                value={investmentData.initialAmount || ''}
                onChange={(e) => setInvestmentData(prev => ({...prev, initialAmount: parseFloat(e.target.value)}))}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>투자 성향</FormLabel>
              <RadioGroup
                value={investmentData.riskPreference}
                onChange={(value) => setInvestmentData(prev => ({...prev, riskPreference: value}))}
              >
                <Stack direction="row" spacing={6} justify="center">
                  <Radio value="안정" colorScheme="green">안정</Radio>
                  <Radio value="보통" colorScheme="blue">보통</Radio>
                  <Radio value="위험" colorScheme="red">위험</Radio>
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
        
      </Container>
    );
  }
  
  export default CreateInvestPage;
  
