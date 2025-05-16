import { ChakraProvider, Box } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import HomePage from "./pages/HomePage";
import TransferPage from "./pages/TransferPage";
import SettingPage from "./pages/SettingPage";
import DetailPage from "./pages/DetailPage";
import CreateInvestPage from "./pages/CreateInvestPage";
import theme from "./theme";
import { UserProvider } from "./contexts/UserContext";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />}>
          <Route index element={<HomePage />} />
          <Route path="transfer" element={<TransferPage />} />
          <Route path="settings" element={<SettingPage />} />
          <Route path="detail" element={<DetailPage />} />
          <Route path="create" element={<CreateInvestPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" w="100vw" overflowX="hidden">
        <Router>
          <UserProvider>
            <AnimatedRoutes />
          </UserProvider>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
