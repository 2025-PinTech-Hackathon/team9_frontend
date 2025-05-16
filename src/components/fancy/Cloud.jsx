import { Box, Image } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;




const Cloud = ({ size, opacity, position, delay }) => {
    const src = "/src/assets/farm3d/cloud.svg";
    const animation = `${floatAnimation} 3s ease-in-out ${delay}s infinite`;
    
    return (
      <Image
        src={src}
        alt="구름"
        w={size}
        h="auto"
        opacity={opacity}
        position="absolute"

        {...position}
        animation={animation}
      />
    );
  };

export default Cloud;