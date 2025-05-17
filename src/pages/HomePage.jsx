import Farm from "../components/Farm.jsx";
import { Box, Container, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { customFetch } from "../utils/fetch";
import config from "../../config.json";
import { motion } from "framer-motion";

function HomePage() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const toast = useToast();

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

  const handleInvestmentUpdate = (updatedInvestment) => {
    toast({
      title: "물 주기 완료",
      description: "물을 정상적으로 줬습니다. 😊",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    const amount = updatedInvestment.amount;
    setInvestments(prevInvestments => 
      prevInvestments.map(inv => 
        inv.internal_position === updatedInvestment.internal_position 
          ? updatedInvestment 
          : inv
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
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
            <Farm 
              investments={investments} 
              onNavigate={navigate} 
              onInvestmentUpdate={handleInvestmentUpdate}
            />
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
}

export default HomePage;
