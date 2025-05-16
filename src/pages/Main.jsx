import {
  Box,
  Container,
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faGear,
  faMoneyBillTransfer,
} from "@fortawesome/free-solid-svg-icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser } from '../contexts/UserContext';
import Cloud from '../components/fancy/Cloud';

function Main() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, isLoading, error } = useUser();
  const bgColor = useColorModeValue("white", "brand.darkGray");

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

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="md"
          textAlign="center"
        >
          <Text color="red.500">에러가 발생했습니다 😢: {error}</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="brand.sky">
      <Container maxW="1024px" h="100vh" position="relative" overflow="hidden">
        {/* 배경 구름들 */}
        <Box position="absolute" w="100%" h="100%" zIndex={1} pointerEvents="none">
          {clouds.map((cloud, index) => (
            <Cloud
              key={index}
              {...cloud}
            />
          ))}
        </Box>

        <Box
            position="relative"
            zIndex={1}
            h="90%"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
          <Outlet />
        </Box>
      </Container>

      {/* 하단 네비게이션 */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={bgColor}
        boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
      >
        <Container maxW="1024px">
          <Flex justify="space-around" py={4}>
            <IconButton
              aria-label="입출금"
              icon={<FontAwesomeIcon icon={faMoneyBillTransfer} size="lg" />}
              variant={
                location.pathname.includes("/transfer") ? "solid" : "ghost"
              }
              colorScheme="brand"
              onClick={() => navigate("transfer")}
            />
            <IconButton
              aria-label="홈"
              icon={<FontAwesomeIcon icon={faHome} size="lg" />}
              variant={location.pathname === "/main" ? "solid" : "ghost"}
              colorScheme="brand"
              onClick={() => navigate("/main")}
            />
            <IconButton
              aria-label="설정"
              icon={<FontAwesomeIcon icon={faGear} size="lg" />}
              variant={
                location.pathname.includes("/settings") ? "solid" : "ghost"
              }
              colorScheme="brand"
              onClick={() => navigate("settings")}
            />
          </Flex>
        </Container>
      </Box>

      {/* <Box p={4}>
        <Text>환영합니다, {userInfo?.email}님!</Text>
        <Text>비트코인 잔액: {userInfo?.bitcoin_balance}</Text>
        <Text>이더리움 잔액: {userInfo?.ethereum_balance}</Text>
        <Text>솔라나 잔액: {userInfo?.solana_balance}</Text>
      </Box> */}
    </Box>
  );
}

export default Main;
