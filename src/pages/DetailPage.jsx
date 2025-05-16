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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FarmDetail from "../components/FarmDetail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

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

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        const response = await fetch(
          `https://api.example.com/investments/${investmentId}`,
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
      }
    };

    if (investmentId) {
      fetchInvestmentData();
    }
  }, [investmentId]);

  return (
    <Container maxW="1024px" px={4} py={8}>
      <Heading as="h1" mb={8} textAlign="center">
        투자 정보 페이지
      </Heading>

      {/* <Box 
            ref={canvasRef}
            mb={8}
            width="100%"
            height="400px"
            border="1px solid"
            borderColor="gray.200"
        /> */}
      <FarmDetail />

      <Table mb={8}>
        <Thead>
          <Tr>
            <Th>구분</Th>
            <Th>내용</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>투자 시작일</Td>
            <Td>{investmentData.startDate}</Td>
          </Tr>
          <Tr>
            <Td>투자 기간</Td>
            <Td>{investmentData.duration}일</Td>
          </Tr>
          <Tr>
            <Td>투자 강도</Td>
            <Td>
              <Box
                w="200px"
                h="20px"
                bgGradient="linear(to-r, green.400, yellow.400, red.400)"
                borderRadius="md"
                position="relative"
              >
                <Box
                  position="absolute"
                  left={`${(investmentData.riskLevel / 3) * 100}%`}
                  top="0"
                  w="2px"
                  h="100%"
                  bg="black"
                />
              </Box>
            </Td>
          </Tr>
          <Tr>
            <Td>예상 수익</Td>
            <Td>{investmentData.expectedReturn}%</Td>
          </Tr>
          <Tr>
            <Td>출금 가능 금액</Td>
            <Td>{investmentData.availableAmount.toLocaleString()}원</Td>
          </Tr>
        </Tbody>
      </Table>

      <HStack spacing={4} justify="center">
        <Button
          colorScheme="brand"
          variant="solid"
          size="lg"
          bg="brand.success"
        >
          추가 입금
        </Button>
        <Button colorScheme="brand" variant="solid" size="lg" bg="brand.danger">
          추가 출금
        </Button>
        <Button
          colorScheme="brand"
          variant="solid"
          size="sm"
          bg="brand.primary"
        >
          <FontAwesomeIcon icon={faCog} />
        </Button>
      </HStack>
    </Container>
  );
}

export default DetailPage;
