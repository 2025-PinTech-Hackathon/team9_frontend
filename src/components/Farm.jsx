import React, {
    useCallback,
    useState,
    useEffect,
    useRef,
    memo
} from "react";
import { useNavigate } from "react-router-dom";
import grassTexture from "../assets/farm/grass1.png";

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const BASE_WIDTH = 1024;
const BASE_HEIGHT = 700;
const absXOffset = 180;
const absYOffset = 170;

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


// Ground: 잔디 타일
const Ground = memo(({ x, y, onClick }) => (
    <img
        src={grassTexture}
        alt=""
        style={{
            position: "absolute",
            left: x,
            top: y,
            width: TILE_WIDTH * 1.5,
            height: TILE_HEIGHT,
            cursor: "pointer",
            userSelect: "none",
        }}
        onClick={onClick}
    />
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

const Farm = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [waterDrops, setWaterDrops] = useState([]);
    const [isWatering, setIsWatering] = useState(false);

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

    const handleTileClick = useCallback(
        (id) => {
            console.log("tile clicked:", id);
            navigate(`/main/create?id=${id}`);
        },
        [navigate]
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
            <div
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    position: "relative",
                }}
            >
                {/* 땅(타일) 그리기 */}
                {positions.map((p) => (
                    <Ground
                        key={p.id}
                        x={p.x - TILE_WIDTH / 2 + absXOffset}
                        y={p.y - TILE_HEIGHT / 2 + absYOffset}
                        onClick={() => handleTileClick(p.id)}
                    />
                ))}

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
            </div>
        </div>
    );
};

Farm.displayName = "Farm";

export default Farm;
