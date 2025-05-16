import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import AuthLayout from "../components/AuthLayout";
import { customFetch } from "../utils/fetch";
import { useLoading } from "../hooks/useLoading";
import config from "../../config.json";
import LoadingSpinner from "../components/LoadingSpinner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoading, withLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await withLoading(
        customFetch(`${config.hostname}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
      );

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);

      toast({
        title: "로그인 성공",
        description: "로그인에 성공했습니다.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/main");
    } catch (error) {
      console.error(error);
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호를 확인해주세요.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthLayout>
      <VStack spacing={4} align="stretch">
        <Heading textAlign="center">로그인</Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>이메일</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>비밀번호</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full">
              로그인
            </Button>
          </VStack>
        </form>
        <Text textAlign="center">
          계정이 없으신가요?{" "}
          <Link as={RouterLink} to="/register" color="teal.500">
            회원가입
          </Link>
        </Text>
      </VStack>
    </AuthLayout>
  );
}

export default Login;
