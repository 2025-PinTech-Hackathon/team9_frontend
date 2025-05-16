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

const FarmDetail = () => {
  const [waterDrops, setWaterDrops] = useState([]);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        
        // 고정된 canvas 크기와 비율
        const baseWidth = 1024;
        const baseHeight = 700;
        const aspectRatio = baseHeight / baseWidth;
        
        // 컨테이너의 width에 맞춰 height 계산
        const newHeight = containerWidth * aspectRatio;
        
        // 컨테이너의 height 업데이트
        containerRef.current.style.height = `${newHeight}px`;
        
        // 스케일 계산 (width 기준)
        const newScale = containerWidth / baseWidth;
        setScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateScale();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const removeWaterDrop = useCallback((id) => {
    setWaterDrops((prev) => prev.filter((drop) => drop.id !== id));
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Application 
        width={1024} 
        height={700} 
        background={0x87ceeb}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <pixiContainer scale={scale}>
          {/* 중앙에 땅과 나무 배치 */}
          <pixiContainer>
            <Ground x={512} y={350} />
            <Tree x={412} y={350} scale={0.8} />
          </pixiContainer>

          {/* 물방울들 */}
          {waterDrops.map((drop) => (
            <WaterDrop
              key={drop.id}
              x={drop.x}
              y={drop.y}
              onComplete={() => removeWaterDrop(drop.id)}
            />
          ))}
        </pixiContainer>
      </Application>
    </div>
  );
};

export default FarmDetail;
