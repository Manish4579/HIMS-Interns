
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  Badge,
  Flex,
  Text,
  VStack,
  HStack,
  IconButton,
  Grid,
  Center,
  Divider,
} from "@chakra-ui/react";
import { StarIcon, EditIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";

function FeedbackList() {
  const toast = useToast();
  const [feedbackList, setFeedbackList] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= FETCH ================= */
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
       const token=localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/feedback/getFeedback",{
        headers:{
          "Authorization": `Bearer ${token}`
  }
      });
      if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const data = await res.json();

      if (data.success) {
        setFeedbackList(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast({
        title: "Failed to fetch feedback",
        description: err.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;

    try {
       const token=localStorage.getItem("token")
      const res = await fetch(
        `http://localhost:3000/feedback/deleteFeedback/${id}`,
        { method: "DELETE",headers:{
          "Authorization": `Bearer ${token}`
  } }
      );
      if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const result = await res.json();

      if (result.success) {
        setFeedbackList((prev) =>
          prev.filter((item) => item.feedback_id !== id)
        );
        toast({
          title: "Deleted successfully",
          status: "success",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast({
        title: err.message,
        status: "error",
      });
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <Box 
        p={8} 
        bg="white" 
        borderRadius="2xl" 
        boxShadow="0 10px 30px rgba(0,0,0,0.05)" 
        border="1px" 
        borderColor="gray.50"
      >
        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="blue.700" fontWeight="800">
              Feedback Records
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Manage and review patient experience data across departments.
            </Text>
          </VStack>
          <Button 
            leftIcon={<span>+</span>} 
            colorScheme="teal" 
            variant="solid" 
            borderRadius="xl"
            onClick={() => navigate("/feedback")}
          >
            New Entry
          </Button>
        </Flex>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th color="gray.400" fontSize="xs" py={5}>Ref ID</Th>
              <Th color="gray.400" fontSize="xs">Patient Name</Th>
              <Th color="gray.400" fontSize="xs">Service Type</Th>
              <Th color="gray.400" fontSize="xs">Overall Score</Th>
              <Th color="gray.400" fontSize="xs" textAlign="right">Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {feedbackList.map((item) => (
              <Tr key={item.feedback_id} _hover={{ bg: "gray.50" }} transition="0.2s">
                <Td fontWeight="bold" color="blue.600">#{item.feedback_id}</Td>
                <Td>
                  <Text fontWeight="semibold" color="gray.700">{item.patient_name}</Text>
                </Td>
                <Td>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" fontSize="10px">
                    {item.service_type}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <Text fontWeight="bold" color="orange.400">{item.overall_rating}</Text>
                    <StarIcon boxSize={3} color="orange.400" />
                  </HStack>
                </Td>
                <Td textAlign="right">
                  <HStack justify="end" spacing={2}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      colorScheme="blue" 
                      onClick={() => setViewData(item)}
                    >
                      View
                    </Button>
                    <IconButton 
                      size="sm" 
                      variant="ghost" 
                      colorScheme="gray" 
                      icon={<EditIcon />} 
                      aria-label="Edit"
                      onClick={() => navigate("/feedback", { state: { editData: item } })}
                    />
                    <IconButton 
                      size="sm" 
                      variant="ghost" 
                      colorScheme="red" 
                      icon={<DeleteIcon />} 
                      aria-label="Delete"
                      onClick={() => handleDelete(item.feedback_id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* ================= VIEW DRAWER ================= */}
      <Drawer
        isOpen={!!viewData}
        placement="right"
        onClose={() => setViewData(null)}
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderLeftRadius="3xl">
          <DrawerCloseButton mt={2} />
          <DrawerHeader borderBottomWidth="1px" color="blue.700" fontWeight="bold" fontSize="xl">
            Feedback Summary
          </DrawerHeader>

          <DrawerBody bg="gray.25" py={6}>
            <VStack spacing={6} align="stretch">
              
              {/* Patient Info Card */}
              <Box bg="white" p={5} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100">
                <HStack mb={4}>
                  <Box p={2} bg="blue.50" color="blue.600" borderRadius="lg">
                    <InfoOutlineIcon />
                  </Box>
                  <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500">
                    Administrative Details
                  </Heading>
                </HStack>

                <Grid templateColumns="1fr 1fr" gap={6}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="bold" color="gray.400">PATIENT NAME</Text>
                    <Text fontWeight="bold" color="gray.700">{viewData?.patient_name}</Text>
                  </VStack>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="bold" color="gray.400">PATIENT ID</Text>
                    <Text fontWeight="bold" color="gray.700">#{viewData?.patient_id}</Text>
                  </VStack>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="bold" color="gray.400">SERVICE UNIT</Text>
                    <Badge colorScheme="blue" variant="subtle">{viewData?.service_type}</Badge>
                  </VStack>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="10px" fontWeight="bold" color="gray.400">ADMISSION REF</Text>
                    <Text fontWeight="bold" color="gray.700">{viewData?.admission_id}</Text>
                  </VStack>
                </Grid>
              </Box>

              {/* Satisfaction Card */}
              <Box bg="white" p={5} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100">
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500">
                    Clinical Experience
                  </Heading>
                  <Badge colorScheme={viewData?.consent_flag ? "teal" : "red"} px={3} borderRadius="full">
                    Consent: {viewData?.consent_flag ? "Given" : "Declined"}
                  </Badge>
                </Flex>

                <HStack mb={4} spacing={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      boxSize={5}
                      color={star <= viewData?.overall_rating ? "orange.400" : "gray.200"}
                    />
                  ))}
                  <Text fontWeight="800" fontSize="lg" ml={2} color="orange.400">
                    {viewData?.overall_rating}/5
                  </Text>
                </HStack>

                <Box p={4} bg="gray.50" borderRadius="xl" borderLeft="4px solid" borderColor="blue.400">
                  <Text fontSize="sm" color="gray.700" fontStyle="italic">
                    "{viewData?.feedback_comments?.trim() ? viewData.feedback_comments : "No additional comments recorded."}"
                  </Text>
                </Box>
              </Box>

              {/* Module Breakdown */}
              <Box px={1}>
                <Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.500" mb={4}>
                  Departmental Breakdown
                </Heading>

                {viewData?.module_ratings?.length > 0 ? (
                  <VStack spacing={3}>
                    {viewData.module_ratings.map((module, index) => (
                      <Box 
                        key={index} 
                        w="full" 
                        p={4} 
                        bg="white" 
                        borderRadius="xl" 
                        border="1px" 
                        borderColor="gray.100" 
                        boxShadow="xs"
                      >
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="sm" color="blue.700">{module.module_name}</Text>
                            <Text fontSize="xs" color="gray.500">{module.comment || "N/A"}</Text>
                          </VStack>
                          <HStack bg="blue.50" px={3} py={1} borderRadius="lg">
                            <StarIcon boxSize={2} color="blue.500" />
                            <Text fontWeight="bold" fontSize="xs" color="blue.600">{module.rating}</Text>
                          </HStack>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Center p={10} border="2px dashed" borderColor="gray.100" borderRadius="2xl">
                    <Text color="gray.400" fontSize="xs" fontWeight="bold">NO MODULE DATA AVAILABLE</Text>
                  </Center>
                )}
              </Box>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" bg="white">
            <Button variant="ghost" mr={3} onClick={() => setViewData(null)}>
              Close
            </Button>
            <Button 
              colorScheme="blue" 
              bg="blue.700" 
              _hover={{ bg: "blue.800" }}
              leftIcon={<EditIcon />}
              onClick={() => {
                const data = viewData;
                setViewData(null);
                navigate("/feedback", { state: { editData: data } });
              }}
            >
              Edit Record
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default FeedbackList;