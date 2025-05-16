import React, {
    useCallback,
    useState,
    useEffect,
    useRef,
    memo
} from "react";
import { useNavigate } from "react-router-dom";
import grassTexture from "../assets/farm/grass1.png";
import bigTreeImage from "../assets/farm/big_tree.png";
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
} from "@chakra-ui/react";

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const BASE_WIDTH = 1024;
const BASE_HEIGHT = 700;
const absXOffset = 180;
const absYOffset = 120;
const absTreeXOffset = 180;
const absTreeYOffset = 40;

const positions = [
    { x: 350, y: 160, id: 1 },
    { x: 250, y: 220, id: 2 },
    { x: 450, y: 220, id: 3 },
    { x: 150, y: 280, id: 4 },
    { x: 350, y: 280, id: 5 },
    { x: 550, y: 280, id: 6 },
    { x: 250, y: 340, id: 7 },
    { x: 450, y: 340, id: 8 },
    { x: 350, y: 400, id: 9 },
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
            left: x - 100,
            top: y - 120,
            zIndex: 10,
            pointerEvents: "none",
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
const Ground = memo(({ x, y, onClick, isHovered, hoveredTileExists, onMouseEnter, onMouseLeave, hasInvestment }) => (
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
            src={grassTexture}
            alt=""
            style={{
                width: "100%",
                height: "100%",
                userSelect: "none",
                transition: `opacity ${HOVER_ANIMATION_DURATION}s ease`,
                opacity: hoveredTileExists && !isHovered ? 0.5 : 1,
            }}
        />
        <AnimatePresence>
            {isHovered && !hasInvestment && (
                <EmptyTileTooltip x={TILE_WIDTH * 0.75} y={TILE_HEIGHT * 0.5} />
            )}
        </AnimatePresence>
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
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#00bfff",
                pointerEvents: "none",
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
const InvestmentSummary = memo(({ investments }) => {
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.initial_amount, 0);
    const totalProfit = investments.reduce((sum, inv) => sum + inv.current_profit, 0);
    const totalWithdrawable = totalInvestment + totalProfit;
    const totalProfitRate = totalInvestment > 0 
        ? (totalProfit / totalInvestment) * 100 
        : 0;

    return (
        <Box
            position="absolute"
            left="20px"
            top="20px"
            bg="transparent"
            p={4}
            width="auto"
            minWidth="280px"
            zIndex={5}
        >
            <VStack spacing={1} align="stretch">
                <Text fontSize="md" fontWeight="semibold" color="gray.600" mb={-1}>
                    출금 가능 금액
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {totalWithdrawable.toLocaleString()}원
                </Text>
                <HStack spacing={2} mt={2}>
                    <Text fontSize="sm" color="gray.500">
                        수익률
                    </Text>
                    <Badge
                        colorScheme={totalProfit >= 0 ? "green" : "red"}
                        variant="subtle"
                        px={2}
                        py={0.5}
                    >
                        {totalProfit >= 0 ? "+" : ""}
                        {totalProfitRate.toFixed(1)}%
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                        {totalProfit >= 0 ? "+" : ""}
                        {totalProfit.toLocaleString()}원
                    </Text>
                </HStack>
            </VStack>
        </Box>
    );
});

const Farm = ({ investments = [] }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [waterDrops, setWaterDrops] = useState([]);
    const [isWatering, setIsWatering] = useState(false);
    const [hoveredTileId, setHoveredTileId] = useState(null);
    const [selectedTileId, setSelectedTileId] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);

    // 타일 등장 순서 정의
    const tileOrder = [1, 2, 4, 3, 5, 7, 6, 8, 9];

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
        // 컴포넌트 마운트 시 애니메이션 상태 초기화
        setSelectedTileId(null);
        setIsTransitioning(false);
        
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

    const handleTileClick = useCallback(
        (id) => {
            console.log("tile clicked:", id);
            const hasInvestment = investments.some(investment => investment.internal_position === id);
            if (hasInvestment) {
                navigate(`/main/detail?id=${id}`);
            } else {
                setSelectedTileId(id);
                setIsTransitioning(true);
                setTimeout(() => {
                    navigate(`/main/create?id=${id}`);
                }, 500);
            }
        },
        [navigate, investments]
    );

    const addWaterDrop = useCallback(() => {
        if (isWatering) return;
        setIsWatering(true);
        setWaterDrops(prev => [
            ...prev,
            {
                id: Date.now(),
                x: Math.random() * (dropMaxX - dropMinX) + dropMinX
            }
        ]);
        setTimeout(() => setIsWatering(false), 1000);
    }, [isWatering]);

    const removeWaterDrop = useCallback((id) => {
        setWaterDrops((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const handleMouseEnter = useCallback((id) => {
        setHoveredTileId(id);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredTileId(null);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
            }}
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
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* 투자 정보 요약 */}
                <InvestmentSummary investments={investments} />

                {positions.map((p) => {
                    const investment = investments.find(inv => inv.internal_position === p.id);
                    const isHovered = hoveredTileId === p.id;
                    const delay = isInitialAnimationDone ? 0 : getAnimationDelay(p.id);

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
                                    zIndex: hoveredTileId === p.id ? 2 : 1
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
                                        <motion.img
                                            src={bigTreeImage}
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
                                            }}
                                        />
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
                <button
                    onClick={addWaterDrop}
                    style={{
                        position: "absolute",
                        left: 900,
                        top: 500,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "#4169E1",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 24,
                        color: "#fff",
                    }}
                >
                    💧
                </button>
            </motion.div>
        </div>
    );
};

Farm.displayName = "Farm";

export default Farm;
