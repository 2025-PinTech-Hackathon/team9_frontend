import { Application, extend, useTick } from "@pixi/react";
import { useCallback, useState, useEffect, useRef, memo } from "react";
import { Texture, Container, Sprite, Graphics, Assets, Rectangle } from "pixi.js";
import grassTexture from "../assets/farm/grass1.png";
import treeSvg from "../assets/farm/big_tree.png";

extend({
  Container,
  Graphics,
  Sprite,
});

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const TREE_WIDTH = 100;
const TREE_HEIGHT = 150;

const Tree = ({ x, y, scale = 1 }) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loadTexture = async () => {
      const loadedTexture = await Assets.load(treeSvg);
      setTexture(loadedTexture);
    };
    loadTexture();
  }, []);

  if (!texture) return null;

  return (
    <pixiContainer x={x} y={y} scale={scale}>
      <pixiSprite
        texture={texture}
        width={TREE_WIDTH}
        height={TREE_HEIGHT}
        anchor={0.5}
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

const Farm = memo(({ onNavigate }) => {
  const containerRef = useRef(null);
  const [waterDrops, setWaterDrops] = useState([]);
  const [isWatering, setIsWatering] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 700 });
  const [scale, setScale] = useState(1);

  const handlePositionClick = useCallback((id, level) => {
    console.log(id, level);
    if (level === 0) {
      onNavigate(`/main/create?id=${id}`);
    }
  }, [onNavigate]);

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
    { x: 400, y: 200, id: 1, level: 0 }, // 1
    { x: 300, y: 260, id: 2, level: 1 },
    { x: 500, y: 260, id: 3, level: 1 }, // 2
    { x: 200, y: 320, id: 4, level: 2 },
    { x: 400, y: 320, id: 5, level: 2 },
    { x: 600, y: 320, id: 6, level: 2 }, // 3
    { x: 300, y: 380, id: 7, level: 1 },
    { x: 500, y: 380, id: 8, level: 1 }, // 2
    { x: 400, y: 440, id: 9, level: 0 }, // 1
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
            <pixiContainer 
              key={index}
              interactive={true}
              pointerdown={() => handlePositionClick(pos.id, pos.level)}
              hitArea={new Rectangle(
                pos.x - TILE_WIDTH / 2 + absXOffset - TILE_WIDTH * 0.75,
                pos.y - TILE_HEIGHT / 2 + absYOffset - TILE_HEIGHT * 0.5,
                TILE_WIDTH * 1.5,
                TILE_HEIGHT
              )}
            >
              <Ground
                x={pos.x - TILE_WIDTH / 2 + absXOffset}
                y={pos.y - TILE_HEIGHT / 2 + absYOffset}
              />
              <Tree
                x={pos.x - TILE_WIDTH / 2 + absXOffset}
                y={pos.y - TILE_HEIGHT / 2 + absYOffset - (pos.id === 5 ? 90 : 50)}
                scale={
                  pos.id === 5 ? 3 : // 중앙 나무
                  pos.id === 1 || pos.id === 9 ? 0.7 : // 맨 위와 맨 아래
                  pos.level === 1 ? 0.85 : // 중간 레벨
                  0.75 // 나머지
                }
              />
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
});

Farm.displayName = 'Farm';

export default Farm;
