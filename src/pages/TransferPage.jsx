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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    Spinner,
    Radio,
    RadioGroup,
    Stack,
    FormControl,
    FormLabel,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Code,
    SimpleGrid,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '@chakra-ui/icons';

// 타입 정의
/**
 * @typedef {Object} Transaction
 * @property {number} id - 거래 ID
 * @property {'입금'|'출금'} type - 거래 유형
 * @property {number} amount - 거래 금액
 * @property {string} date - 거래 일시 (문자열)
 * @property {number} timestamp - 거래 일시 (타임스탬프)
 * @property {'대기'|'완료'|'실패'} status - 거래 상태
 * @property {string} [bank] - 은행명 (출금 시에만)
 * @property {string} [accountNumber] - 계좌번호 (출금 시에만)
 * @property {string} [accountHolder] - 예금주명 (출금 시에만)
 */

/**
 * @typedef {Object} WithdrawInfo
 * @property {string} bank - 은행명
 * @property {string} accountNumber - 계좌번호
 * @property {string} accountHolder - 예금주명
 */

/**
 * @typedef {Object} VirtualAccount
 * @property {string} bank - 은행명
 * @property {string} accountNumber - 계좌번호
 * @property {string} accountHolder - 예금주명
 */

// API 엔드포인트 상수
const API_ENDPOINTS = {
    DEPOSIT: '/api/v1/transactions/deposit',
    WITHDRAW: '/api/v1/transactions/withdraw',
    TRANSACTION_HISTORY: '/api/v1/transactions/history',
    BALANCE: '/api/v1/balance',
};

// 은행 목록 상수
const BANK_LIST = [
    '신한은행',
    '국민은행',
    '우리은행',
    '하나은행',
    '농협은행',
    '기업은행',
];

// 거래 상태 상수
const TRANSACTION_STATUS = {
    PENDING: '대기',
    COMPLETED: '완료',
    FAILED: '실패',
};

// 정렬 옵션 상수
const SORT_OPTIONS = {
    LATEST: 'latest',
    OLDEST: 'oldest',
    AMOUNT_HIGH: 'amount',
};

// 페이지당 항목 수 상수
const ITEMS_PER_PAGE = 5;

const WithdrawModal = React.memo(({
                                      isOpen,
                                      onClose,
                                      amount,
                                      onWithdraw,
                                      withdrawInfo,
                                      onWithdrawInfoChange,
                                      bankList
                                  }) => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>출금 계좌 입력</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                <VStack spacing={4}>
                    <FormControl isRequired>
                        <FormLabel>출금 받으실 은행</FormLabel>
                        <Select
                            placeholder="은행을 선택하세요"
                            value={withdrawInfo.bank}
                            onChange={(e) => onWithdrawInfoChange({
                                ...withdrawInfo,
                                bank: e.target.value
                            })}
                        >
                            {bankList.map((bank) => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>계좌번호</FormLabel>
                        <Input
                            placeholder="계좌번호를 입력하세요"
                            value={withdrawInfo.accountNumber}
                            onChange={(e) => onWithdrawInfoChange({
                                ...withdrawInfo,
                                accountNumber: e.target.value
                            })}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>예금주명</FormLabel>
                        <Input
                            placeholder="예금주명을 입력하세요"
                            value={withdrawInfo.accountHolder}
                            onChange={(e) => onWithdrawInfoChange({
                                ...withdrawInfo,
                                accountHolder: e.target.value
                            })}
                        />
                    </FormControl>

                    <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">출금 금액</Text>
                            <Text fontSize="xl" color="green.500" fontWeight="bold">
                                {parseInt(amount).toLocaleString()}원
                            </Text>
                        </VStack>
                    </Alert>
                </VStack>
            </ModalBody>

            <ModalFooter>
                <Button
                    colorScheme="green"
                    mr={3}
                    onClick={onWithdraw}
                    isDisabled={
                        !withdrawInfo.bank ||
                        !withdrawInfo.accountNumber ||
                        !withdrawInfo.accountHolder
                    }
                >
                    출금하기
                </Button>
                <Button onClick={onClose}>취소</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
));

const DepositModal = React.memo(({
                                     isOpen,
                                     onClose,
                                     onDeposit,
                                     amount,
                                     virtualAccount
                                 }) => (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>입금 안내</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                <VStack spacing={4} align="stretch">
                    <Alert
                        status="info"
                        variant="subtle"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        borderRadius="lg"
                        py={4}
                    >
                        <AlertIcon boxSize="6" mr={0} />
                        <AlertTitle mt={4} mb={1} fontSize="lg">
                            입금 계좌 정보
                        </AlertTitle>
                        <AlertDescription maxWidth="sm">
                            아래 계좌로 입금해 주시면<br />
                            확인 후 자동으로 반영됩니다.
                        </AlertDescription>
                    </Alert>

                    <VStack spacing={3} bg="green.50" p={4} borderRadius="lg">
                        <HStack justify="space-between" w="full">
                            <Text color="gray.600">은행</Text>
                            <Text fontWeight="bold">{virtualAccount.bank}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                            <Text color="gray.600">계좌번호</Text>
                            <Code p={2} fontSize="md" fontWeight="bold">
                                {virtualAccount.accountNumber}
                            </Code>
                        </HStack>
                        <HStack justify="space-between" w="full">
                            <Text color="gray.600">예금주</Text>
                            <Text fontWeight="bold">{virtualAccount.accountHolder}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                            <Text color="gray.600">입금금액</Text>
                            <Text fontWeight="bold" color="green.500">
                                {parseInt(amount).toLocaleString()}원
                            </Text>
                        </HStack>
                    </VStack>

                    <Alert status="warning" borderRadius="lg">
                        <AlertIcon />
                        <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">입금 시 주의사항</Text>
                            <Text fontSize="sm">• 입금자명이 달라도 정상 처리됩니다.</Text>
                            <Text fontSize="sm">• 입금 확인까지 최대 10분이 소요될 수 있습니다.</Text>
                            <Text fontSize="sm">• 입금 금액이 정확히 일치해야 합니다.</Text>
                        </VStack>
                    </Alert>
                </VStack>
            </ModalBody>

            <ModalFooter>
                <Button colorScheme="green" mr={3} onClick={onDeposit}>
                    확인
                </Button>
                <Button onClick={onClose}>취소</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
));

const TransferPage = () => {
    // 잔액 및 금액 상태
    const [balance, setBalance] = useState(0);
    const [inputAmount, setInputAmount] = useState('');

    // 거래 내역 상태
    const [transactionList, setTransactionList] = useState([]);
    const [filteredTransactionList, setFilteredTransactionList] = useState([]);
    const [sortOption, setSortOption] = useState(SORT_OPTIONS.LATEST);

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState(1);

    // 필터링 상태
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
    const [amountRangeFilter, setAmountRangeFilter] = useState({
        min: '',
        max: '',
    });
    const [dateRangeFilter, setDateRangeFilter] = useState({
        startDate: '',
        endDate: '',
    });

    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [withdrawFormData, setWithdrawFormData] = useState({
        bank: '',
        accountNumber: '',
        accountHolder: '',
    });

    // 가상 계좌 정보 (실제로는 API에서 받아올 정보)
    const virtualAccountInfo = {
        bank: '신한은행',
        accountNumber: '110-123-456789',
        accountHolder: '코인봇'
    };

    // 거래 내역 더미 데이터 (실제로는 API에서 받아올 데이터)
    useEffect(() => {
        const dummyTransactions = Array.from({ length: 20 }, (_, index) => {
            const date = new Date(2024, 2, index + 1);
            return {
                id: index + 1,
                type: index % 3 === 0 ? '출금' : '입금',
                amount: Math.floor(Math.random() * 1000000) + 10000,
                date: date.toLocaleString(),
                timestamp: date.getTime(),
                status: TRANSACTION_STATUS.COMPLETED,
            };
        });

        // 최신순으로 정렬
        const sortedTransactions = sortTransactionList(dummyTransactions, SORT_OPTIONS.LATEST);
        setTransactionList(sortedTransactions);
        setFilteredTransactionList(sortedTransactions);
    }, []);

    // 천 단위 구분 기호 적용 함수
    const formatCurrency = (value) => {
        if (!value) return '';
        const numbers = value.replace(/[^0-9]/g, '');
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleAmountInputChange = (e) => {
        const value = e.target.value;
        if (/^[0-9,]*$/.test(value)) {
            setInputAmount(value.replace(/,/g, ''));
        }
    };

    // 모달 제어 함수
    const handleModalOpen = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalType(null);
        setWithdrawFormData({
            bank: '',
            accountNumber: '',
            accountHolder: '',
        });
    };

    // 입금 처리 함수
    const handleDeposit = async () => {
        handleModalClose();
        const depositAmount = parseInt(inputAmount);
        const currentDate = new Date();

        const depositToastId = toast({
            title: '입금 진행 중',
            description: '입금이 처리되고 있습니다...',
            status: 'info',
            duration: null,
            isClosable: false,
        });

        try {
            // TODO: API 호출로 대체
            await new Promise(resolve => setTimeout(resolve, 3000));

            const newTransaction = {
                id: Date.now(),
                type: '입금',
                amount: depositAmount,
                date: currentDate.toLocaleString(),
                timestamp: currentDate.getTime(),
                status: TRANSACTION_STATUS.COMPLETED,
            };

            const updatedTransactions = [newTransaction, ...transactionList];
            setTransactionList(updatedTransactions);
            setFilteredTransactionList(sortTransactionList(updatedTransactions, sortOption));
            setBalance(prev => prev + depositAmount);

            toast.update(depositToastId, {
                title: '입금 완료',
                description: `${depositAmount.toLocaleString()}원이 입금되었습니다.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            toast.update(depositToastId, {
                title: '입금 실패',
                description: '처리 중 오류가 발생했습니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }

        setInputAmount('');
    };

    // 출금 처리 함수
    const handleWithdraw = async () => {
        const { bank, accountNumber, accountHolder } = withdrawFormData;
        const withdrawAmount = parseInt(inputAmount);
        const currentDate = new Date();

        if (!bank || !accountNumber || !accountHolder) {
            toast({
                title: '입력 오류',
                description: '모든 필수 정보를 입력해주세요.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (withdrawAmount > balance) {
            toast({
                title: '출금 실패',
                description: '잔액이 부족합니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        handleModalClose();

        const withdrawToastId = toast({
            title: '출금 진행 중',
            description: '출금이 처리되고 있습니다...',
            status: 'info',
            duration: null,
            isClosable: false,
        });

        try {
            // TODO: API 호출로 대체
            await new Promise(resolve => setTimeout(resolve, 3000));

            const newTransaction = {
                id: Date.now(),
                type: '출금',
                amount: withdrawAmount,
                date: currentDate.toLocaleString(),
                timestamp: currentDate.getTime(),
                status: TRANSACTION_STATUS.COMPLETED,
                bank,
                accountNumber,
                accountHolder,
            };

            const updatedTransactions = [newTransaction, ...transactionList];
            setTransactionList(updatedTransactions);
            setFilteredTransactionList(sortTransactionList(updatedTransactions, sortOption));
            setBalance(prev => prev - withdrawAmount);

            toast.update(withdrawToastId, {
                title: '출금 완료',
                description: '출금이 정상적으로 처리되었습니다.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            toast.update(withdrawToastId, {
                title: '출금 실패',
                description: '처리 중 오류가 발생했습니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }

        setInputAmount('');
        setWithdrawFormData({
            bank: '',
            accountNumber: '',
            accountHolder: '',
        });
    };

    // 계좌번호 형식 검증
    const formatAccountNumber = (value) => {
        const numbers = value.replace(/[^0-9]/g, '');
        if (numbers.length <= 14) {
            return numbers.replace(/(\d{3})(\d{1,})/, '$1-$2');
        }
        return value;
    };

    // 정렬 함수
    const sortTransactionList = (transactions, sortType) => {
        const sortedTransactions = [...transactions];
        switch (sortType) {
            case SORT_OPTIONS.LATEST:
                return sortedTransactions.sort((a, b) => b.timestamp - a.timestamp);
            case SORT_OPTIONS.OLDEST:
                return sortedTransactions.sort((a, b) => a.timestamp - b.timestamp);
            case SORT_OPTIONS.AMOUNT_HIGH:
                return sortedTransactions.sort((a, b) => b.amount - a.amount);
            default:
                return sortedTransactions;
        }
    };

    // 필터링 함수
    const applyTransactionFilters = () => {
        let filtered = [...transactionList];

        if (transactionTypeFilter !== 'all') {
            filtered = filtered.filter(transaction => transaction.type === transactionTypeFilter);
        }

        if (amountRangeFilter.min) {
            filtered = filtered.filter(transaction =>
                transaction.amount >= parseInt(amountRangeFilter.min)
            );
        }
        if (amountRangeFilter.max) {
            filtered = filtered.filter(transaction =>
                transaction.amount <= parseInt(amountRangeFilter.max)
            );
        }

        if (dateRangeFilter.startDate) {
            filtered = filtered.filter(transaction =>
                new Date(transaction.date) >= new Date(dateRangeFilter.startDate)
            );
        }
        if (dateRangeFilter.endDate) {
            filtered = filtered.filter(transaction =>
                new Date(transaction.date) <= new Date(dateRangeFilter.endDate + 'T23:59:59')
            );
        }

        filtered = sortTransactionList(filtered, sortOption);
        setFilteredTransactionList(filtered);
        setCurrentPage(1);
    };

    // 정렬 옵션 변경 핸들러
    const handleSortOptionChange = (newSortOption) => {
        setSortOption(newSortOption);
        const sorted = sortTransactionList(filteredTransactionList, newSortOption);
        setFilteredTransactionList(sorted);
    };

    // 필터 초기화
    const resetTransactionFilters = () => {
        setTransactionTypeFilter('all');
        setAmountRangeFilter({ min: '', max: '' });
        setDateRangeFilter({ startDate: '', endDate: '' });
        setSortOption(SORT_OPTIONS.LATEST);
        setFilteredTransactionList(sortTransactionList(transactionList, SORT_OPTIONS.LATEST));
        setCurrentPage(1);
    };

    // 페이지네이션 계산
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentPageItems = filteredTransactionList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactionList.length / ITEMS_PER_PAGE);

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <Box
            maxH="88vh"
            bg={useColorModeValue('gray.50', 'gray.900')}
            overflowX="hidden"
            overflowY="auto"
            sx={{
                "&::-webkit-scrollbar": {
                    width: "0",
                    height: "0",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}
        >
            <Container maxW="1200px" py={10} px={20}>
                <VStack spacing={8} align="stretch" w="full">
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
                                                    value={formatCurrency(inputAmount)}
                                                    onChange={handleAmountInputChange}
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
                                                onClick={() => handleModalOpen('입금')}
                                                isDisabled={!inputAmount}
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
                                                    value={formatCurrency(inputAmount)}
                                                    onChange={handleAmountInputChange}
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
                                                onClick={() => handleModalOpen('출금')}
                                                isDisabled={!inputAmount}
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
                                        {/* 첫 번째 줄: 거래 유형 선택 */}
                                        <HStack spacing={4} width="full">
                                            <Select
                                                value={transactionTypeFilter}
                                                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                                                bg="white"
                                                size="lg"
                                            >
                                                <option value="all">전체</option>
                                                <option value="입금">입금</option>
                                                <option value="출금">출금</option>
                                            </Select>
                                        </HStack>

                                        {/* 두 번째 줄: 금액 범위 */}
                                        <HStack spacing={4} width="full">
                                            <InputGroup size="lg">
                                                <NumberInput
                                                    min={0}
                                                    value={amountRangeFilter.min}
                                                    onChange={(value) => setAmountRangeFilter({ ...amountRangeFilter, min: value })}
                                                    bg="white"
                                                    w="full"
                                                >
                                                    <NumberInputField placeholder="최소 금액" />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </InputGroup>
                                            <InputGroup size="lg">
                                                <NumberInput
                                                    min={0}
                                                    value={amountRangeFilter.max}
                                                    onChange={(value) => setAmountRangeFilter({ ...amountRangeFilter, max: value })}
                                                    bg="white"
                                                    w="full"
                                                >
                                                    <NumberInputField placeholder="최대 금액" />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>
                                            </InputGroup>
                                        </HStack>

                                        {/* 세 번째 줄: 날짜 범위 */}
                                        <HStack spacing={4} width="full">
                                            <Input
                                                type="date"
                                                value={dateRangeFilter.startDate}
                                                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, startDate: e.target.value })}
                                                bg="white"
                                                size="lg"
                                            />
                                            <Input
                                                type="date"
                                                value={dateRangeFilter.endDate}
                                                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, endDate: e.target.value })}
                                                bg="white"
                                                size="lg"
                                            />
                                        </HStack>

                                        {/* 네 번째 줄: 버튼들 */}
                                        <HStack spacing={4} width="full" justify="flex-end">
                                            <Button
                                                leftIcon={<SearchIcon />}
                                                colorScheme="green"
                                                onClick={applyTransactionFilters}
                                                size="lg"
                                                minW="120px"
                                                px={8}
                                            >
                                                검색
                                            </Button>
                                            <Button
                                                variant="outline"
                                                colorScheme="green"
                                                onClick={resetTransactionFilters}
                                                size="lg"
                                                minW="120px"
                                                px={8}
                                            >
                                                초기화
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </Card>

                                {/* 거래 내역 테이블 */}
                                <TableContainer>
                                    <HStack spacing={4} mb={4} justify="flex-end">
                                        <Text>정렬:</Text>
                                        <Select
                                            value={sortOption}
                                            onChange={(e) => handleSortOptionChange(e.target.value)}
                                            width="200px"
                                            size="sm"
                                        >
                                            <option value="latest">최신순</option>
                                            <option value="oldest">오래된순</option>
                                            <option value="amount">금액 높은순</option>
                                        </Select>
                                    </HStack>
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
                                            {currentPageItems.map((transaction) => (
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

                    {/* 입금/출금 모달 */}
                    <DepositModal
                        isOpen={isModalOpen && modalType === '입금'}
                        onClose={handleModalClose}
                        onDeposit={handleDeposit}
                        amount={inputAmount}
                        virtualAccount={virtualAccountInfo}
                    />
                    <WithdrawModal
                        isOpen={isModalOpen && modalType === '출금'}
                        onClose={handleModalClose}
                        amount={inputAmount}
                        onWithdraw={handleWithdraw}
                        withdrawInfo={withdrawFormData}
                        onWithdrawInfoChange={setWithdrawFormData}
                        bankList={BANK_LIST}
                    />
                </VStack>
            </Container>
        </Box>
    );
};

export default TransferPage;
