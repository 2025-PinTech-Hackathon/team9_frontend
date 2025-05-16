import Farm from "../components/Farm.jsx";
import { Box, Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { customFetch } from "../utils/fetch";
import config from "../../config.json";

function HomePage() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await customFetch(`${config.hostname}/investments`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.investments) {
          console.log(data.investments);
          setInvestments(data.investments);
        }
      } catch (error) {
        console.error("투자 정보를 가져오는데 실패했습니다:", error);
      }
    };

    fetchInvestments();
  }, []);

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
        position="relative"
        zIndex={1}
      >
        <br />
        <Box 
          width="100%"
          height="100%"
          position="relative"
          zIndex={1}
        >
          <Farm investments={investments} onNavigate={navigate} />
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;
