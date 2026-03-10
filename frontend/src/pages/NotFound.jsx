import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function NotFound() {

  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      bg="gray.100"
    >
      <VStack spacing={4}>

        <Heading size="2xl" color="red.500">
          404
        </Heading>

        <Heading size="md">
          Page Not Found
        </Heading>

        <Text color="gray.600">
          The page you are looking for does not exist.
        </Text>

        <Button
          colorScheme="blue"
          onClick={() => navigate("/employee-dashboard")}
        >
          Go to Dashboard
        </Button>

      </VStack>
    </Box>
  );
}

export default NotFound;