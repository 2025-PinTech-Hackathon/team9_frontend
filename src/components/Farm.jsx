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

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const BASE_WIDTH = 1024;
const BASE_HEIGHT = 700;
const absXOffset = 180;
const absYOffset = 170;
const absTreeXOffset = 180;
const absTreeYOffset = 90;

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

// Ground: 잔디 타일
const Ground = memo(({ x, y, onClick, isHovered, hoveredTileExists, onMouseEnter, onMouseLeave }) => (
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
                {/* 땅(타일) 그리기 */}
                {positions.map((p) => (
                    <motion.div
                        key={p.id}
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
                            delay: isInitialAnimationDone ? 0 : getAnimationDelay(p.id),
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
                            isHovered={hoveredTileId === p.id}
                            hoveredTileExists={hoveredTileId !== null}
                            onMouseEnter={() => handleMouseEnter(p.id)}
                            onMouseLeave={handleMouseLeave}
                        />
                    </motion.div>
                ))}

                {/* 투자 위치에 나무 표시 */}
                {investments.map((investment) => {
                    const position = positions.find(p => p.id === investment.internal_position);
                    if (!position) return null;
                    
                    const isHovered = hoveredTileId === investment.internal_position;
                    
                    return (
                        <motion.div
                            key={investment.id}
                            initial={{
                                opacity: 0,
                                y: -50
                            }}
                            animate={{
                                opacity: selectedTileId ? 0 : 1,
                                y: isHovered ? -10 : 0
                            }}
                            transition={{
                                duration: HOVER_ANIMATION_DURATION,
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
                                    left: position.x - TILE_WIDTH / 2 + absTreeXOffset,
                                    top: position.y - TILE_HEIGHT / 2 + absTreeYOffset,
                                    width: TILE_WIDTH * 1.5,
                                    height: TILE_HEIGHT * 1.4,
                                    pointerEvents: "none",
                                }}
                            />
                        </motion.div>
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
