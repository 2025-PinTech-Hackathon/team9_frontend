import { Application, extend, useTick } from "@pixi/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { Texture, Container, Sprite, Graphics, Assets } from "pixi.js";
import grassTexture from "../assets/farm/grass1.png";

extend({
  Container,
  Graphics,
  Sprite,
});

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const TREE_HEIGHT = 100;

const Tree = ({ x, y, scale = 1 }) => {
  return (
    <pixiContainer x={x} y={y} scale={scale}>
      {/* 나무 줄기 */}
      <pixiGraphics
        draw={(g) => {
          // 나무 줄기
          g.beginFill(0x8b4513);
          g.moveTo(-8, 0);
          g.lineTo(8, 0);
          g.lineTo(6, TREE_HEIGHT);
          g.lineTo(-6, TREE_HEIGHT);
          g.endFill();

          // 나무 껍질 질감
          g.lineStyle(1, 0x654321);
          g.moveTo(-6, 10);
          g.lineTo(-4, TREE_HEIGHT - 10);
          g.moveTo(0, 10);
          g.lineTo(0, TREE_HEIGHT - 10);
          g.moveTo(4, 10);
          g.lineTo(6, TREE_HEIGHT - 10);
        }}
      />
      {/* 나무 잎 */}
      <pixiGraphics
        draw={(g) => {
          // 잎의 기본 모양
          g.beginFill(0x228b22);
          g.drawEllipse(0, -30, 35, 25);
          g.endFill();

          // 잎의 하이라이트
          g.beginFill(0x32cd32);
          g.drawEllipse(-10, -35, 15, 10);
          g.endFill();
        }}
      />
    </pixiContainer>
  );
};

const Ground = ({ x, y }) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loadTexture = async () => {
      const loadedTexture = await Assets.load(grassTexture);
      setTexture(loadedTexture);
    };
    loadTexture();
  }, []);

  if (!texture) return null;

  return (
    <pixiContainer x={x} y={y}>
      <pixiSprite
        texture={texture}
        width={TILE_WIDTH * 1.5}
        height={TILE_HEIGHT}
        anchor={0.5}
      />
    </pixiContainer>
  );
};

const WaterDrop = ({ x, y, onComplete }) => {
  const [position, setPosition] = useState({ x, y });

  useTick((delta) => {
    setPosition((prev) => ({
      x: prev.x,
      y: prev.y + 5 * delta,
    }));

    if (position.y > 400) {
      onComplete();
    }
  });

  return (
    <pixiGraphics
      x={position.x}
      y={position.y}
      draw={(g) => {
        g.beginFill(0x00bfff);
        g.drawCircle(0, 0, 5);
        g.endFill();
      }}
    />
  );
};

const Farm = () => {
  const [waterDrops, setWaterDrops] = useState([]);
  const [isWatering, setIsWatering] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 700 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // 기준 크기
        const baseWidth = 1024;
        const baseHeight = 700;

        // 컨테이너 크기에 맞춰 스케일 계산
        const scaleX = containerWidth / baseWidth;
        const scaleY = containerHeight / baseHeight;
        const newScale = Math.min(scaleX, scaleY);

        setScale(newScale);
        setDimensions({
          width: baseWidth * newScale,
          height: baseHeight * newScale,
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const addWaterDrop = useCallback(() => {
    if (isWatering) return;

    setIsWatering(true);
    const newDrop = {
      id: Date.now(),
      x: Math.random() * 400,
      y: 0,
    };

    setWaterDrops((prev) => [...prev, newDrop]);

    setTimeout(() => {
      setIsWatering(false);
    }, 1000);
  }, [isWatering]);

  const removeWaterDrop = useCallback((id) => {
    setWaterDrops((prev) => prev.filter((drop) => drop.id !== id));
  }, []);

  // 1-2-3-2-1 패턴의 위치 계산
  const absXOffset = 180;
  const absYOffset = 170;
  const positions = [
    { x: 400, y: 200 }, // 1
    { x: 300, y: 260 },
    { x: 500, y: 260 }, // 2
    { x: 200, y: 320 },
    { x: 400, y: 320 },
    { x: 600, y: 320 }, // 3
    { x: 300, y: 380 },
    { x: 500, y: 380 }, // 2
    { x: 400, y: 440 }, // 1
  ];

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
      <Application
        width={dimensions.width}
        height={dimensions.height}
        background={0x87ceeb}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <pixiContainer scale={scale}>
          {/* 땅과 나무 배치 */}
          {positions.map((pos, index) => (
            <pixiContainer key={index}>
              <Ground
                x={pos.x - TILE_WIDTH / 2 + absXOffset}
                y={pos.y - TILE_HEIGHT / 2 + absYOffset}
              />
              {/* <Tree x={pos.x} y={pos.y} scale={0.8} /> */}
            </pixiContainer>
          ))}

          {/* 물방울들 */}
          {waterDrops.map((drop) => (
            <WaterDrop
              key={drop.id}
              x={drop.x}
              y={drop.y}
              onComplete={() => removeWaterDrop(drop.id)}
            />
          ))}

          {/* 물주기 버튼 */}
          {/* <pixiGraphics
                        x={700}
                        y={500}
                        interactive={true}
                        pointerdown={addWaterDrop}
                        draw={(g) => {
                            g.beginFill(0x4169E1);
                            g.drawCircle(0, 0, 30);
                            g.endFill();
                            
                            g.beginFill(0xFFFFFF);
                            g.drawCircle(-10, -10, 5);
                            g.drawCircle(10, -10, 5);
                            g.drawCircle(0, 10, 10);
                            g.endFill();
                        }}
                    /> */}
        </pixiContainer>
      </Application>
    </div>
  );
};

export default Farm;
