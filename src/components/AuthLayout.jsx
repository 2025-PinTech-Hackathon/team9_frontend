import { Box } from "@chakra-ui/react";
import Cloud from "./fancy/Cloud";


function AuthLayout({ children }) {
  const clouds = [
    {
      size: "150px",
      opacity: 0.8,
      position: { top: "20px", right: "50px" },
      delay: 0
    },
    {
      size: "120px",
      opacity: 0.7,
      position: { top: "130px", right: "150px" },
      delay: 0.5
    },
    {
      size: "120px",
      opacity: 0.9,
      position: { top: "50px", right: "250px" },
      delay: 1
    }
  ];

  return (
    <Box
      minH="100vh"
      bg="brand.sky"
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* 메인 컨테이너 */}
      <Box w="100%" h="100vh" maxW="1024px" px={4} position="relative">
        {/* 배경 구름들 */}
        <Box position="absolute" w="100%" h="100%" zIndex={0}>
          {clouds.map((cloud, index) => (
            <Cloud
              key={index}
              {...cloud}
            />
          ))}
        </Box>

        {/* 메인 컨텐츠 */}
        <Box 
          position="relative" 
          zIndex={1}
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            p={8}
            borderWidth={1}
            borderRadius="lg"
            bg="white"
            boxShadow="lg"
            w="full"
            maxW="md"
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AuthLayout;
