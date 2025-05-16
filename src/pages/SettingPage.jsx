import { Box, Container, VStack, Image, Text, Button, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import defaultUserImage from "../assets/default_user_image.png";

function SettingPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "로그아웃 되었습니다.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    navigate("/login");
  };

  return (
    <Container maxW="1024px" px={4} py={8}>
      <VStack spacing={6} align="center">
        <Box mb={8}>
          <Image
            src={defaultUserImage}
            alt="프로필 이미지"
            boxSize="150px"
            borderRadius="full"
            objectFit="cover"
          />
        </Box>
        
        <VStack spacing={4} align="center">
          <Text fontSize="xl" fontWeight="bold">
            {localStorage.getItem("userId") || "사용자"}
          </Text>
          <Text fontSize="md" color="gray.600">
            {localStorage.getItem("userEmail") || "이메일 정보 없음"}
          </Text>
        </VStack>

        <Button
          colorScheme="red"
          variant="outline"
          onClick={handleLogout}
          mt={4}
        >
          로그아웃
        </Button>
      </VStack>
    </Container>
  );
}

export default SettingPage;
