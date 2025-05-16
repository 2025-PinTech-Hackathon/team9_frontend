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
import config from "../../config.json";
import { customFetch } from "../utils/fetch";
import { useLoading } from "../hooks/useLoading";
import LoadingSpinner from "../components/LoadingSpinner";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoading, withLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await withLoading(
        customFetch(`${config.hostname}/api/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
      );

      toast({
        title: "회원가입 성공",
        description: "회원가입에 성공했습니다!.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "이미 존재하는 이메일이거나 서버 오류가 발생했습니다.",
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
        <Heading textAlign="center">회원가입</Heading>
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
            <FormControl isRequired>
              <FormLabel>비밀번호 확인</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full">
              회원가입
            </Button>
          </VStack>
        </form>
        <Text textAlign="center">
          이미 계정이 있으신가요?{" "}
          <Link as={RouterLink} to="/login" color="teal.500">
            로그인
          </Link>
        </Text>
      </VStack>
    </AuthLayout>
  );
}

export default Register;
