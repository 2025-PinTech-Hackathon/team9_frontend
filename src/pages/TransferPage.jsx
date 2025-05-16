import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  Input,
  VStack,
  Card,
  CardBody,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  InputGroup,
  InputRightAddon,
  HStack,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '@chakra-ui/icons';

const TransferPage = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // 필터링 상태
  const [filterType, setFilterType] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 거래 내역 더미 데이터
  useEffect(() => {
    const dummyData = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      type: index % 3 === 0 ? '출금' : '입금',
      amount: Math.floor(Math.random() * 1000000) + 10000,
      date: new Date(2024, 2, index + 1).toLocaleString(),
      status: '완료',
    }));
    setTransactions(dummyData);
    setFilteredTransactions(dummyData);
  }, []);

  // 천 단위 구분 기호 적용 함수
  const formatAmount = (value) => {
    if (!value) return '';
    const numbers = value.replace(/[^0-9]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^[0-9,]*$/.test(value)) {
      setAmount(value.replace(/,/g, ''));
    }
  };

  const handleTransfer = (type) => {
    if (!amount) return;
    
    const newTransaction = {
      id: transactions.length + 1,
      type: type,
      amount: parseInt(amount),
      date: new Date().toLocaleString(),
      status: '완료',
    };

    setTransactions([newTransaction, ...transactions]);
    setBalance(prev => type === '입금' ? prev + parseInt(amount) : prev - parseInt(amount));
    setAmount('');
  };

  // 필터링 함수
  const applyFilters = () => {
    let filtered = [...transactions];

    // 거래 유형 필터
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // 금액 범위 필터
    if (minAmount) {
      filtered = filtered.filter(transaction => transaction.amount >= parseInt(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(transaction => transaction.amount <= parseInt(maxAmount));
    }

    // 날짜 범위 필터
    if (startDate) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(endDate + 'T23:59:59')
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // 필터 적용시 첫 페이지로 이동
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilterType('all');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
    setFilteredTransactions(transactions);
    setCurrentPage(1);
  };

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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
                입출금 관리
              </Heading>
              <VStack spacing={2} align="center">
                <Text color="green.600" fontSize="lg">현재 잔액</Text>
                <Heading color="green.800" fontSize="4xl">
                  {balance.toLocaleString()}원
                </Heading>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card
          bg={useColorModeValue('white', 'gray.800')}
          border="1px"
          borderColor="green.100"
          borderRadius="xl"
        >
          <CardBody p={6}>
            <Tabs isFitted variant="soft-rounded" colorScheme="green">
              <TabList mb={4}>
                <Tab>입금하기</Tab>
                <Tab>출금하기</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    <InputGroup size="lg">
                      <Input
                        placeholder="입금액을 입력하세요"
                        value={formatAmount(amount)}
                        onChange={handleAmountChange}
                        borderColor="green.200"
                        _hover={{ borderColor: 'green.300' }}
                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                      />
                      <InputRightAddon children="원" bg="green.50" color="green.800" />
                    </InputGroup>
                    <Button
                      colorScheme="green"
                      size="lg"
                      width="full"
                      onClick={() => handleTransfer('입금')}
                      isDisabled={!amount}
                    >
                      입금하기
                    </Button>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4}>
                    <InputGroup size="lg">
                      <Input
                        placeholder="출금액을 입력하세요"
                        value={formatAmount(amount)}
                        onChange={handleAmountChange}
                        borderColor="green.200"
                        _hover={{ borderColor: 'green.300' }}
                        _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                      />
                      <InputRightAddon children="원" bg="green.50" color="green.800" />
                    </InputGroup>
                    <Button
                      colorScheme="green"
                      size="lg"
                      width="full"
                      onClick={() => handleTransfer('출금')}
                      isDisabled={!amount}
                    >
                      출금하기
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        <Card
          bg={useColorModeValue('white', 'gray.800')}
          border="1px"
          borderColor="green.100"
          borderRadius="xl"
        >
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              <Heading as="h3" fontSize="xl" color="green.800">
                거래 내역
              </Heading>

              {/* 필터링 섹션 */}
              <Card bg="green.50" p={4}>
                <VStack spacing={4}>
                  <HStack spacing={4} width="full">
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      bg="white"
                    >
                      <option value="all">전체</option>
                      <option value="입금">입금</option>
                      <option value="출금">출금</option>
                    </Select>
                    <InputGroup>
                      <NumberInput
                        min={0}
                        value={minAmount}
                        onChange={(value) => setMinAmount(value)}
                        bg="white"
                      >
                        <NumberInputField placeholder="최소 금액" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </InputGroup>
                    <InputGroup>
                      <NumberInput
                        min={0}
                        value={maxAmount}
                        onChange={(value) => setMaxAmount(value)}
                        bg="white"
                      >
                        <NumberInputField placeholder="최대 금액" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </InputGroup>
                  </HStack>
                  <HStack spacing={4} width="full">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      bg="white"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      bg="white"
                    />
                    <Button
                      leftIcon={<SearchIcon />}
                      colorScheme="green"
                      onClick={applyFilters}
                    >
                      검색
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="green"
                      onClick={resetFilters}
                    >
                      초기화
                    </Button>
                  </HStack>
                </VStack>
              </Card>

              {/* 거래 내역 테이블 */}
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>거래 유형</Th>
                      <Th isNumeric>금액</Th>
                      <Th>거래 일시</Th>
                      <Th>상태</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentItems.map((transaction) => (
                      <Tr key={transaction.id}>
                        <Td color={transaction.type === '입금' ? 'green.500' : 'red.500'}>
                          {transaction.type}
                        </Td>
                        <Td isNumeric>
                          {transaction.amount.toLocaleString()}원
                        </Td>
                        <Td>{transaction.date}</Td>
                        <Td>{transaction.status}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* 페이지네이션 */}
              <Flex justify="center" align="center" mt={4}>
                <HStack>
                  <IconButton
                    icon={<ChevronLeftIcon />}
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    aria-label="이전 페이지"
                    colorScheme="green"
                    variant="outline"
                  />
                  <Text>
                    {currentPage} / {totalPages}
                  </Text>
                  <IconButton
                    icon={<ChevronRightIcon />}
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === totalPages}
                    aria-label="다음 페이지"
                    colorScheme="green"
                    variant="outline"
                  />
                </HStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default TransferPage;
