import AuthLayout from "./AuthLayout";
import { Center, Spinner } from "@chakra-ui/react";

export default function LoadingSpinner() {
  return (
    <AuthLayout>
        <Center
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.5)"
        zIndex="9999"
        >
        <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="white"
            size="xl"
        />
        </Center>
    </AuthLayout>
  );
}
