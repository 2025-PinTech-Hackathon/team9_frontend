import Farm from "../components/Farm.jsx";
import { Box, Container } from "@chakra-ui/react";

function HomePage() {
  return (
    <Container maxW="1024px" px={4} py={8}>
      <Box
        mb={8}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="80vh"
        minHeight="600px"
      >
        홈 페이지
        <br />
        <Box width="100%" height="100%">
          <Farm />
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;
