import { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  Divider,
  Center,
  InputGroup,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
// Optional: Icons for a more professional look
import { FiUser, FiLock } from "react-icons/fi";

function EmployeeLogin() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/employee-dashboard";

  const handleLogin = async () => {
    if (!name || !password) {
      setErrorMsg("Please enter name and password");
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch("http://localhost:3000/employee-login/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: name,
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("employee_id", data.employee.employee_id);
        localStorage.setItem("employee_name", data.employee.employee_name);
        navigate(from);
      } else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="#f4f7f9" // Soft clinical grey/blue background
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        display="flex"
        w="full"
        maxW="900px"
        bg="white"
        boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        borderRadius="xl"
        overflow="hidden"
      >
        {/* Left Side: Branding/Visual */}
        <Box
          w={{ base: "0%", md: "40%" }}
          bg="#1A365D" // Classic Navy Blue
          p={10}
          color="white"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Heading size="lg" mb={4}>
            HIMS Hospital
          </Heading>
          <Divider mb={4} borderColor="whiteAlpha.400" />
          <Text fontSize="sm" fontWeight="light" opacity={0.8}>
            Employee Management Portal
          </Text>
        </Box>

        {/* Right Side: Login Form */}
        <Box w={{ base: "100%", md: "60%" }} p={{ base: 8, md: 12 }}>
          <VStack spacing={6} align="flex-start">
            <Box>
              <Heading size="lg" color="gray.700">
                Welcome Back
              </Heading>
              <Text color="gray.500" mt={1}>
                Please sign in to your staff account
              </Text>
            </Box>

            <VStack spacing={4} w="100%">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiUser} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Employee Name"
                  variant="filled"
                  focusBorderColor="navy.500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  h="50px"
                />
              </InputGroup>

              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="password"
                  placeholder="Password"
                  variant="filled"
                  focusBorderColor="navy.500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  h="50px"
                />
              </InputGroup>

              {errorMsg && (
                <Text color="red.500" fontSize="sm" fontWeight="bold">
                  {errorMsg}
                </Text>
              )}

              <Button
                bg="#2B6CB0" // Deep Steel Blue
                color="white"
                _hover={{ bg: "#2C5282" }}
                w="100%"
                h="50px"
                fontSize="md"
                onClick={handleLogin}
                isLoading={loading}
                mt={2}
              >
                Sign In
              </Button>
            </VStack>

            <Center w="100%">
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Authorized Personnel Only. <br />© 2026 Hospital Building
                Systems
              </Text>
            </Center>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

export default EmployeeLogin;
