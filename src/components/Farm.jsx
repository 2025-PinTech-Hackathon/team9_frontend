import React, {
    useCallback,
    useState,
    useEffect,
    useRef,
    memo
} from "react";
import { useNavigate } from "react-router-dom";
import grassTexture from "../assets/farm/grass1.png";
import grassTexture2 from "../assets/farm/grass2.png";
import grassTexture3 from "../assets/farm/grass3.png";
import bigTreeImage from "../assets/farm/big_tree.png";
import littleTreeImage from "../assets/farm/little_tree.png";
import smallTreeImage from "../assets/farm/small_tree.png";
import waterDropImage from "../assets/waterdrop.png";
import { motion, AnimatePresence } from "framer-motion";
import {
    Box,
    Text,
    VStack,
    HStack,
    Badge,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    InputGroup,
    InputRightAddon,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import config from "../../config.json";

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const BASE_WIDTH = 1024;
const BASE_HEIGHT = 700;
const absXOffset = 180;
const absYOffset = 120;
const absTreeXOffset = 180;
const absTreeYOffset = 40;

const positions = [
    { x: 350, y: 160, id: 1, texture: grassTexture },
    { x: 250, y: 220, id: 2, texture: grassTexture2 },
    { x: 450, y: 220, id: 3, texture: grassTexture3 },
    { x: 150, y: 280, id: 4, texture: grassTexture2 },
    { x: 350, y: 280, id: 5, texture: grassTexture2 },
    { x: 550, y: 280, id: 6, texture: grassTexture },
    { x: 250, y: 340, id: 7, texture: grassTexture },
    { x: 450, y: 340, id: 8, texture: grassTexture2 },
    { x: 350, y: 400, id: 9, texture: grassTexture3 },
];

// FarmHTML.jsx 상단, positions 정의 바로 아래쯤
const tileLefts = positions.map(
    p => p.x - TILE_WIDTH/2 + absXOffset
);
const dropMinX = Math.min(...tileLefts);
const dropMaxX = Math.max(...tileLefts) + TILE_WIDTH * 1.5;

// 호버 효과 애니메이션 시간 상수 정의
const HOVER_ANIMATION_DURATION = 0.2;

// 빈 타일 말풍선 컴포넌트
const EmptyTileTooltip = memo(({ x, y }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        style={{
            position: "absolute",
            left: x - 122,
            top: y - 60,
            zIndex: 9999,
            pointerEvents: "none",
        }}
    >
        <Box
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            p={3}
            width="270px"
            position="relative"
            _after={{
                content: '""',
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "8px",
                borderStyle: "solid",
                borderColor: "white transparent transparent transparent",
            }}
        >
            <VStack spacing={2} align="stretch">
                <Text fontSize="sm" color="gray.600" textAlign="center">
                    ✨ 새로운 투자봇을 심어보세요!
                </Text>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                    이곳에서 당신만의 자동 투자를 시작할 수 있어요
                </Text>
            </VStack>
        </Box>
    </motion.div>
));

// Ground: 잔디 타일
const Ground = memo(({ x, y, onClick, isHovered, hoveredTileExists, onMouseEnter, onMouseLeave, hasInvestment, isQuickWatering, id }) => (
    <motion.div
        style={{
            position: "absolute",
            left: x,
            top: y,
            width: TILE_WIDTH * 1.5,
            height: TILE_HEIGHT,
            cursor: "pointer",
            zIndex: isHovered ? 2 : 1,
        }}
        animate={{
            y: isHovered ? -10 : 0
        }}
        transition={{
            duration: HOVER_ANIMATION_DURATION,
            ease: "easeOut"
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <img
            src={positions[id - 1].texture}
            alt=""
            style={{
                width: "100%",
                height: "100%",
                userSelect: "none",
                transition: `opacity ${HOVER_ANIMATION_DURATION}s ease`,
                opacity: (!hasInvestment && isQuickWatering) || (hoveredTileExists && !isHovered) ? 0.5 : 1,
            }}
        />
    </motion.div>
));

// WaterDrop: 물방울 애니메이션
const WaterDrop = memo(({ x, onComplete }) => {
    const [y, setY] = useState(0);

    useEffect(() => {
        let rafId;
        const animate = () => {
            setY((prev) => {
                const next = prev + 5;
                if (next > 400) {
                    onComplete();
                    return prev;
                }
                return next;
            });
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [onComplete]);

    return (
        <div
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: 20,  // 크기를 10에서 20으로 증가
                height: 20, // 크기를 10에서 20으로 증가
                backgroundImage: `url(${waterDropImage})`,
                backgroundSize: "cover",
                pointerEvents: "none",
                zIndex: 3,
            }}
        />
    );
});

// 투자봇 정보 말풍선 컴포넌트
const InvestmentTooltip = memo(({ investment, x, y }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        style={{
            position: "absolute",
            left: x - 100, // 말풍선 중앙 정렬을 위해 너비의 절반만큼 왼쪽으로 이동
            top: y - 180, // 나무 위에 위치하도록 조정
            zIndex: 10,
            pointerEvents: "none", // 말풍선이 마우스 이벤트를 방해하지 않도록 설정
        }}
    >
        <Box
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            p={3}
            width="200px"
            position="relative"
            _after={{
                content: '""',
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "8px",
                borderStyle: "solid",
                borderColor: "white transparent transparent transparent",
            }}
        >
            <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                    <Text fontWeight="bold" color="gray.700">
                        {investment.coin_type}
                    </Text>
                    <Badge
                        colorScheme={investment.current_profit >= 0 ? "green" : "red"}
                        fontSize="sm"
                    >
                        {investment.current_profit >= 0 ? "+" : ""}
                        {((investment.current_profit / investment.initial_amount) * 100).toFixed(1)}%
                    </Badge>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                    <Text color="gray.600">투자 금액</Text>
                    <Text color="gray.800" fontWeight="semibold">
                        {investment.initial_amount.toLocaleString()}원
                    </Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                    <Text color="gray.600">수익금</Text>
                    <Text 
                        color={investment.current_profit >= 0 ? "green.500" : "red.500"}
                        fontWeight="semibold"
                    >
                        {investment.current_profit >= 0 ? "+" : ""}
                        {investment.current_profit.toLocaleString()}원
                    </Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                    <Text color="gray.600">출금 가능</Text>
                    <Text color="blue.500" fontWeight="bold">
                        {(investment.initial_amount + investment.current_profit).toLocaleString()}원
                    </Text>
                </HStack>
            </VStack>
        </Box>
    </motion.div>
));

// 투자 정보 요약 컴포넌트
const InvestmentSummary = memo(({ investments, scale }) => {
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.initial_amount, 0);
    const totalProfit = investments.reduce((sum, inv) => sum + inv.current_profit, 0);
    const totalWithdrawable = totalInvestment + totalProfit;
    const totalProfitRate = totalInvestment > 0 
        ? (totalProfit / totalInvestment) * 100 
        : 0;

    return (
        <Box
            position="absolute"
            left={`${200 * scale}px`}
            top={`${40 * scale}px`}
            bg="transparent"
            p={4}
            width="auto"
            minWidth={`${280 * scale}px`}
            zIndex={5}
            transform={`scale(${scale})`}
            transformOrigin="top left"
        >
            <VStack spacing={1} align="stretch">
                <Text fontSize="2xl" fontWeight="semibold" color="gray.600" mb={-1}>
                    출금 가능 금액
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color="gray.800">
                    {totalWithdrawable.toLocaleString(undefined, {maximumFractionDigits: 2})}원
                </Text>
                <HStack spacing={2} mt={2}>
                    <Text fontSize="xl" color="gray.500">
                        수익률
                    </Text>
                    <Badge
                        colorScheme={totalProfit >= 0 ? "green" : "red"}
                        variant="subtle"
                        px={4}
                        py={1}
                        fontSize="xl"
                    >
                        {totalProfit >= 0 ? "+" : ""}
                        {totalProfitRate.toFixed(2)}%
                    </Badge>
                    <Text fontSize="xl" color="gray.500">
                        {totalProfit >= 0 ? "+" : ""}
                        {totalProfit.toLocaleString(undefined, {maximumFractionDigits: 2})}원
                    </Text>
                </HStack>
            </VStack>
        </Box>
    );
});

const Farm = ({ investments = [], onInvestmentUpdate }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [waterDrops, setWaterDrops] = useState([]);
    const [isWatering, setIsWatering] = useState(false);
    const [hoveredTileId, setHoveredTileId] = useState(null);
    const [selectedTileId, setSelectedTileId] = useState(null);
    const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);
    const [isQuickWatering, setIsQuickWatering] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedInvestment, setSelectedInvestment] = useState(null);

    // 타일 등장 순서 정의
    const tileOrder = [1, 2, 4, 3, 5, 7, 6, 8, 9];

    // 투자 금액이 0원 초과인 투자만 표시
    const filteredInvestments = investments.filter(inv => inv.initial_amount > 0);

    useEffect(() => {
        const updateScale = () => {
            const c = containerRef.current;
            if (!c) return;
            const scaleX = c.clientWidth / BASE_WIDTH;
            const scaleY = c.clientHeight / BASE_HEIGHT;
            setScale(Math.min(scaleX, scaleY));
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    useEffect(() => {
        console.log(investments);
    }, [investments]);

    useEffect(() => {
        // 컴포넌트 마운트 시 애니메이션 상태 초기화
        setSelectedTileId(null);
        setIsQuickWatering(false);
        
        // 일정 시간 후에 초기 애니메이션 완료 상태로 변경
        const timer = setTimeout(() => {
            setIsInitialAnimationDone(true);
        }, tileOrder.length * 200 + 500); // 각 타일당 200ms + 여유 시간

        return () => clearTimeout(timer);
    }, []);

    // 타일의 등장 순서에 따른 딜레이 계산
    const getAnimationDelay = (id) => {
        const index = tileOrder.indexOf(id);
        return index * 0.2; // 각 타일 사이 200ms 간격
    };

    const handleQuickWateringClick = () => {
        setIsQuickWatering(prev => !prev);  // 현재 상태의 반대로 토글
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget && isQuickWatering) {
            setIsQuickWatering(false);
        }
    };

    const handleTileClick = useCallback(
        (id) => {
            const investment = filteredInvestments.find(inv => inv.internal_position === id);
            
            if (isQuickWatering) {
                if (investment) {
                    setSelectedInvestment(investment);
                    onOpen();
                }
                return;
            }

            if (investment) {
                navigate(`/main/detail?id=${id}`);
            } else {
                setSelectedTileId(id);
                setTimeout(() => {
                    navigate(`/main/create?id=${id}`);
                }, 500);
            }
        },
        [navigate, filteredInvestments, isQuickWatering, onOpen]
    );

    const addWaterDrop = useCallback(() => {
        if (isWatering) return;
        setIsWatering(true);

        // 선택된 투자봇의 위치 찾기
        const selectedPosition = positions.find(p => p.id === selectedInvestment.internal_position);
        if (!selectedPosition) return;

        // 투자봇의 x 좌표 기준으로 물방울 생성
        const baseX = selectedPosition.x + absTreeXOffset;
        const dropCount = 10; // 물방울 개수
        const spread = 80; // 퍼지는 범위를 130에서 80으로 줄임

        // 여러 개의 물방울 생성
        for (let i = 0; i < dropCount; i++) {
            const randomOffset = (Math.random() - 0.5) * spread;
            setTimeout(() => {
                setWaterDrops(prev => [
                    ...prev,
                    {
                        id: Date.now() + i,
                        x: baseX + randomOffset
                    }
                ]);
            }, i * 100); // 각 물방울 사이에 100ms 간격
        }

        // 모든 물방울이 생성된 후 watering 상태 해제
        setTimeout(() => setIsWatering(false), dropCount * 200 + 1000);
    }, [isWatering, selectedInvestment]);

    const removeWaterDrop = useCallback((id) => {
        setWaterDrops((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const handleMouseEnter = useCallback((id) => {
        setHoveredTileId(id);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredTileId(null);
    }, []);

    // 금액 포맷팅 함수
    const formatAmount = (value) => {
        if (!value) return '';
        const numbers = value.replace(/[^0-9]/g, '');
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // 입력 처리 함수
    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^[0-9,]*$/.test(value)) {
            setDepositAmount(value.replace(/,/g, ''));
        }
    };

    // 빠른 입금 처리 함수
    const handleQuickDeposit = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error('액세스 토큰이 없습니다.');
                return;
            }

            const response = await fetch(`${config.hostname}/investments/${selectedInvestment.id}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    amount: parseInt(depositAmount.replace(/,/g, ''))
                })
            });

            if (!response.ok) {
                throw new Error('입금 처리 중 오류가 발생했습니다.');
            }

            const data = await response.json();
            
            // 부모 컴포넌트의 investments 상태 업데이트
            if (typeof onInvestmentUpdate === 'function') {
                onInvestmentUpdate(data.investment);
            }

            // 성공적으로 처리된 경우
            onClose();
            setIsQuickWatering(false);
            setDepositAmount('');
            
            // 물주기 애니메이션 실행
            addWaterDrop();

            // Dispatch custom event for bird animation
            window.dispatchEvent(new Event('investmentComplete'));
            
        } catch (error) {
            console.error('입금 처리 중 오류:', error);
            // TODO: 에러 메시지 표시
        }
    };

    // hoveredTileId가 빈 타일(투자 없는 타일)일 때만 말풍선 표시
    const hoveredEmptyTile = positions.find(
        p => p.id === hoveredTileId && !filteredInvestments.find(inv => inv.internal_position === p.id)
    );

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
            }}
            onClick={handleBackgroundClick}
        >
            <motion.div
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    position: "relative",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {/* 투자 정보 요약 */}
                <InvestmentSummary investments={filteredInvestments} scale={scale} />

                {positions.map((p) => {
                    const investment = filteredInvestments.find(inv => inv.internal_position === p.id);
                    const isHovered = hoveredTileId === p.id;
                    const delay = isInitialAnimationDone ? 0 : getAnimationDelay(p.id);
                    const isDisabled = isQuickWatering && !investment;

                    return (
                        <React.Fragment key={p.id}>
                            {/* 땅(타일) */}
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: -50
                                }}
                                animate={{
                                    opacity: selectedTileId ? (p.id === selectedTileId ? 1 : 0) : 1,
                                    scale: selectedTileId && p.id === selectedTileId ? 1.1 : 1,
                                    y: selectedTileId && p.id === selectedTileId ? -20 : 0
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay,
                                    ease: "easeOut"
                                }}
                                style={{
                                    position: "relative",
                                    zIndex: hoveredTileId === p.id ? 2 : 1,
                                    opacity: isDisabled ? 0.5 : 1,
                                    pointerEvents: isDisabled ? 'none' : 'auto'
                                }}
                            >
                                <Ground
                                    x={p.x - TILE_WIDTH / 2 + absXOffset}
                                    y={p.y - TILE_HEIGHT / 2 + absYOffset}
                                    onClick={() => handleTileClick(p.id)}
                                    isHovered={isHovered}
                                    hoveredTileExists={hoveredTileId !== null}
                                    onMouseEnter={() => handleMouseEnter(p.id)}
                                    onMouseLeave={handleMouseLeave}
                                    hasInvestment={!!investment}
                                    isQuickWatering={isQuickWatering}
                                    id={p.id}
                                />
                            </motion.div>

                            {/* 투자봇 나무 */}
                            {investment && (
                                <React.Fragment>
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: -50
                                        }}
                                        animate={{
                                            opacity: selectedTileId ? 0 : 1,
                                            y: isHovered ? -10 : 0
                                        }}
                                        transition={{
                                            duration: isInitialAnimationDone ? HOVER_ANIMATION_DURATION : 0.5,
                                            delay,
                                            ease: "easeOut"
                                        }}
                                        style={{
                                            position: "relative",
                                            zIndex: 3
                                        }}
                                    >
                                        {(() => {
                                            const profitRate = (investment.current_profit / investment.initial_amount) * 100;
                                            const investmentAmount = investment.initial_amount + investment.current_profit;
                                            let treeImage;
                                            let treeScale;

                                            // 수익률이나 투자금액 중 하나라도 큰 나무 조건을 만족하면 큰 나무로
                                            if (profitRate < 10 && investmentAmount < 200000) {
                                                treeImage = littleTreeImage;
                                                treeScale = 0.7;
                                            } else if ((profitRate >= 10 && profitRate < 20) || (investmentAmount >= 200000 && investmentAmount < 1000000)) {
                                                treeImage = smallTreeImage;
                                                treeScale = 0.85;
                                            } else {
                                                treeImage = bigTreeImage;
                                                if (profitRate >= 20 || investmentAmount >= 1000000) {
                                                    // 300만원 단위로 크기 증가, 최대 2배까지
                                                    const scaleByAmount = Math.min(1 + Math.floor((investmentAmount - 1000000) / 3000000) * 0.3, 2);
                                                    // 수익률 10% 단위로 크기 증가, 최대 2배까지
                                                    const scaleByProfit = Math.min(1 + Math.floor((profitRate - 20) / 10) * 0.3, 2);
                                                    // 둘 중 더 큰 값 사용
                                                    treeScale = Math.max(scaleByAmount, scaleByProfit);
                                                } else {
                                                    treeScale = 1;
                                                }
                                            }

                                            return (
                                                <motion.img
                                                    src={treeImage}
                                                    alt="Investment Tree"
                                                    animate={{
                                                        opacity: hoveredTileId !== null && !isHovered ? 0.5 : 1
                                                    }}
                                                    transition={{
                                                        duration: HOVER_ANIMATION_DURATION,
                                                        ease: "easeOut"
                                                    }}
                                                    style={{
                                                        position: "absolute",
                                                        left: p.x - TILE_WIDTH / 2 + absTreeXOffset,
                                                        top: p.y - TILE_HEIGHT / 2 + absTreeYOffset,
                                                        width: TILE_WIDTH * 1.5,
                                                        height: TILE_HEIGHT * 1.4,
                                                        pointerEvents: "none",
                                                        transform: `scale(${treeScale})`,
                                                        transformOrigin: 'center bottom'
                                                    }}
                                                />
                                            );
                                        })()}
                                    </motion.div>

                                    {/* 투자봇 정보 말풍선 */}
                                    <AnimatePresence>
                                        {isHovered && (
                                            <InvestmentTooltip
                                                investment={investment}
                                                x={p.x + absTreeXOffset}
                                                y={p.y + absTreeYOffset}
                                            />
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            )}
                        </React.Fragment>
                    );
                })}

                {/* 물방울들 */}
                {waterDrops.map((drop) => (
                    <WaterDrop
                        key={drop.id}
                        x={drop.x}
                        onComplete={() => removeWaterDrop(drop.id)}
                    />
                ))}

                {/* 물주기 버튼 (화면 좌표 기준) */}
                <Tooltip 
                    label={isQuickWatering ? "빠른 입금 모드 종료" : "빠르게 물 주기"}
                    bg="blue.500" 
                    color="white"
                    borderRadius="md"
                    hasArrow
                >
                    <button
                        onClick={handleQuickWateringClick}
                        style={{
                            position: "absolute",
                            right: `${180 * scale}px`,  // 오른쪽에서의 거리를 줄임
                            bottom: `${180 * scale}px`, // 아래에서의 거리를 줄임
                            width: `${60 * scale}px`,
                            height: `${60 * scale}px`,
                            borderRadius: "50%",
                            backgroundColor: isQuickWatering ? "#2E4EA1" : "#4169E1",
                            border: "none",
                            cursor: "pointer",
                            fontSize: `${24 * scale}px`,
                            color: "#fff",
                            transition: "all 0.2s",
                            transform: isQuickWatering ? "scale(0.95)" : "scale(1)",
                            boxShadow: isQuickWatering ? 
                                "0 0 15px rgba(46, 78, 161, 0.5)" : 
                                "0 4px 8px rgba(0, 0, 0, 0.1)",
                            zIndex: 4
                        }}
                    >
                        💧
                    </button>
                </Tooltip>

                {/* 빠르게 물 주기 안내 메시지 */}
                <AnimatePresence>
                    {isQuickWatering && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: "absolute",
                                left: "50%",
                                bottom: `${50 * scale}px`,
                                transform: `translateX(-50%) scale(${scale})`,
                                transformOrigin: "bottom center",
                                textAlign: "center",
                            }}
                        >
                            <Text
                                color="blue.600"
                                fontSize="lg"
                                fontWeight="medium"
                                bg="white"
                                px={6}
                                py={3}
                                borderRadius="full"
                                boxShadow="md"
                            >
                                나무를 클릭하고 빠르게 추가 투자를 진행해보세요!
                            </Text>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 빠른 입금 모달 */}
                <Modal isOpen={isOpen} onClose={() => {
                    onClose();
                    setIsQuickWatering(false);
                }} isCentered>
                    <ModalOverlay backdropFilter="blur(8px)" />
                    <ModalContent
                        borderRadius="2xl"
                        bg="white"
                        p={4}
                    >
                        <ModalHeader
                            borderBottomWidth="1px"
                            borderColor="blue.100"
                            color="blue.800"
                            pb={4}
                        >
                            <HStack>
                                <Text fontSize="1.2em">💧</Text>
                                <Text>빠른 투자하기</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <VStack spacing={4}>
                                <Text color="blue.600">투자할 금액을 입력해주세요</Text>
                                <VStack width="100%" spacing={1} align="stretch">
                                    <InputGroup size="lg">
                                        <Input
                                            placeholder="0"
                                            value={formatAmount(depositAmount)}
                                            onChange={handleAmountChange}
                                            textAlign="right"
                                            borderRadius="xl"
                                            borderColor="blue.200"
                                            pr="4.5rem"
                                            _focus={{
                                                borderColor: "blue.400",
                                                boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
                                            }}
                                            _hover={{
                                                borderColor: "blue.300"
                                            }}
                                        />
                                        <InputRightAddon
                                            children="KRW"
                                            bg="blue.50"
                                            borderColor="blue.200"
                                            borderLeftWidth="0"
                                            roundedRight="xl"
                                        />
                                    </InputGroup>
                                </VStack>
                            </VStack>
                        </ModalBody>
                        <ModalFooter
                            borderTopWidth="1px"
                            borderColor="blue.100"
                            pt={4}
                        >
                            <Button
                                variant="ghost"
                                mr={3}
                                onClick={() => {
                                    onClose();
                                    setIsQuickWatering(false);
                                }}
                                color="blue.600"
                                _hover={{ bg: 'blue.50' }}
                            >
                                취소
                            </Button>
                            <Button
                                bg="blue.500"
                                color="white"
                                _hover={{ bg: 'blue.600' }}
                                borderRadius="xl"
                                isDisabled={!depositAmount}
                                onClick={handleQuickDeposit}
                            >
                                {depositAmount ? `${formatAmount(depositAmount)} KRW 투자` : '투자하기'}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </motion.div>

            {/* 빈 타일 말풍선: 타일 map 루프 바깥에서 한 번만 렌더링 */}
            <AnimatePresence>
                {hoveredEmptyTile && (
                    <EmptyTileTooltip
                        x={hoveredEmptyTile.x + absTreeXOffset}
                        y={hoveredEmptyTile.y + absTreeYOffset}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

Farm.displayName = "Farm";

export default Farm;
