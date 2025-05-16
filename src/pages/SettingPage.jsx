import { Box, Container, VStack, Image, Text, Button, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import defaultUserImage from "../assets/default_user_image.png";
import { useUser } from '../contexts/UserContext';

function SettingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { userInfo, isLoading, error } = useUser();

  const handleLogout = () => {
    // localStorage.clear();
    toast({
      title: "로그아웃 되었습니다.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    navigate("/login");
  };

  useEffect(() => {
    console.log("userInfo");
    console.log(userInfo);
  }, [userInfo]);

  if (isLoading) {
    return (
      <Container maxW="1024px" px={4} py={8}>
        <Box textAlign="center">로딩 중...</Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="1024px" px={4} py={8}>
        <Box textAlign="center" color="red.500">에러가 발생했습니다: {error}</Box>
      </Container>
    );
  }

  return (
    <Container maxW="1024px" px={4} py={8}>
      <Box
        maxW="600px"
        mx="auto"
        p={10}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
        mb={8}
      >
        <VStack spacing={6} align="center">
          <Box mb={8}>
            <Image
              src={defaultUserImage}
              alt="프로필 이미지"
              boxSize="150px"
              borderRadius="full"
              objectFit="cover"
              bgColor="white"
            />
          </Box>
          
          <VStack spacing={4} align="center">
            <Text fontSize="xl" fontWeight="bold">
              {userInfo?.email || "사용자"}
            </Text>
            <Text fontSize="md" color="gray.600">
              {userInfo?.email || "이메일 정보 없음"}
            </Text>
          </VStack>

          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleLogout}
            mt={4}
            width="100%"
          >
            로그아웃
          </Button>
        </VStack>
      </Box>
    </Container>
  );
}

export default SettingPage;
