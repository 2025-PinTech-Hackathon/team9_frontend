import { Box, Image } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import birdImage from "../../assets/isometric_bird.png";

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const flyAwayAnimation = keyframes`
  0% { 
    transform: translate(0, 0); 
    opacity: 1;
    z-index: 9999;
  }
  100% { 
    transform: translate(-120vw, 70vh); 
    opacity: 0;
    z-index: 9999;
  }
`;

const flyBackAnimation = keyframes`
  0% { 
    transform: translate(120vw, -70vh);
    opacity: 0;
    z-index: 1;
  }
  100% { 
    transform: translate(0, 0);
    opacity: 1;
    z-index: 1;
  }
`;

const Cloud = ({ size, opacity, position, delay, type = 'cloud', isFlying = false }) => {
    const src = type === 'bird' ? birdImage : "/src/assets/farm3d/cloud.svg";
    let animation = `${floatAnimation} 3s ease-in-out ${delay}s infinite`;
    
    if (type === 'bird' && isFlying) {
      animation = `
        ${flyAwayAnimation} 4s cubic-bezier(0.4, 0, 0.2, 1) forwards,
        ${flyBackAnimation} 2s cubic-bezier(0.4, 0, 0.2, 1) 5s forwards
      `;
    }
    
    return (
      <Image
        src={src}
        alt={type === 'bird' ? "새" : "구름"}
        w={size}
        h="auto"
        opacity={opacity}
        position="absolute"
        {...position}
        animation={animation}
        style={{
          filter: type === 'bird' ? 'none' : undefined,
          transformOrigin: 'center center',
          zIndex: 1
        }}
      />
    );
  };

export default Cloud;