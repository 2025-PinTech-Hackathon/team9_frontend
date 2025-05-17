import { Application, extend, useTick } from "@pixi/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { Texture, Container, Sprite, Graphics, Assets } from "pixi.js";
import grassTexture from "../assets/farm/grass1.png";
import bigTreeImage from "../assets/farm/big_tree.png";
import littleTreeImage from "../assets/farm/little_tree.png";
import smallTreeImage from "../assets/farm/small_tree.png";
import waterDropImage from "../assets/waterdrop.png";
extend({
  Container,
  Graphics,
  Sprite,
});

const TILE_WIDTH = 120;
const TILE_HEIGHT = 120;
const TREE_WIDTH = 100;
const TREE_HEIGHT = 150;

const Tree = ({ x, y, scale = 1, profitRate = 0 }) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loadTexture = async () => {
      let treeImage;
      let treeScale;

      if (profitRate < 10) {
          treeImage = littleTreeImage;
          treeScale = 0.7;
      } else if (profitRate < 20) {
          treeImage = smallTreeImage;
          treeScale = 0.85;
      } else {
          treeImage = bigTreeImage;
          const additionalScale = Math.floor((profitRate - 20) / 10) * 0.3;
          treeScale = 1 + additionalScale;
      }

      const loadedTexture = await Assets.load(treeImage);
      setTexture(loadedTexture);
      scale = treeScale; // 수익률에 따른 크기 적용
    };
    loadTexture();
  }, [profitRate]);

  if (!texture) return null;

  return (
    <pixiContainer x={x} y={y} scale={scale}>
      <pixiSprite
        texture={texture}
        width={TREE_WIDTH}
        height={TREE_HEIGHT}
        anchor={{ x: 0.5, y: 1 }} // 아래 중심점 기준으로 설정
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
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loadTexture = async () => {
      const loadedTexture = await Assets.load(waterDropImage);
      setTexture(loadedTexture);
    };
    loadTexture();
  }, []);

  useTick((delta) => {
    setPosition((prev) => ({
      x: prev.x,
      y: prev.y + 5 * delta,
    }));

    if (position.y > 400) {
      onComplete();
    }
  });

  if (!texture) return null;

  return (
    <pixiContainer x={position.x} y={position.y}>
      <pixiSprite
        texture={texture}
        width={20}
        height={20}
        anchor={0.5}
      />
    </pixiContainer>
  );
};

const FarmDetail = ({ investment }) => {
  const [waterDrops, setWaterDrops] = useState([]);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  // 수익률 계산
  const profitRate = investment ? (investment.current_profit / investment.initial_amount) * 100 : 0;

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
            <Tree x={412} y={350} scale={0.8} profitRate={profitRate} />
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
