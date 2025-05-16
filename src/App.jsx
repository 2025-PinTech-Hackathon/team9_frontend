import { ChakraProvider, Box } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import HomePage from "./pages/HomePage";
import TransferPage from "./pages/TransferPage";
import SettingPage from "./pages/SettingPage";
import DetailPage from "./pages/DetailPage";
import theme from "./theme";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" w="100vw" overflowX="hidden">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/main" element={<Main />}>
              <Route index element={<HomePage />} />
              <Route path="transfer" element={<TransferPage />} />
              <Route path="settings" element={<SettingPage />} />
              <Route path="detail" element={<DetailPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
}

export default App;
