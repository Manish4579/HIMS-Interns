import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  Text,
  useToast,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

export default function Complaints() {
  const navigate=useNavigate()
  const toast = useToast();
  const [fileKey, setFileKey] = useState(Date.now());

  const [formData, setFormData] = useState({
    ticket_number: "",
    raised_by_type: "",
    raised_by_name: "",
    category: "",
    sub_category: "",
    department: "",
    priority: "",
    complaint_description: "",
    attachment_path: null,
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  // ================= HANDLE FILE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, attachment_path: file });
      setFileName(file.name);
      if (errors.attachment_path) setErrors({ ...errors, attachment_path: null });
    }
  };

  // ================= VALIDATION =================
  const validate = () => {
    let newErrors = {};
    if (!formData.raised_by_type) newErrors.raised_by_type = "Required";
    if (!formData.raised_by_name) newErrors.raised_by_name = "Required";

    if (formData.raised_by_type === "EMPLOYEE") {
      if (!formData.category) newErrors.category = "Required";
      if (!formData.sub_category) newErrors.sub_category = "Required";
    }

    if (!formData.department) newErrors.department = "Required";
    if (!formData.priority) newErrors.priority = "Required";

    if (!formData.complaint_description?.trim())
      newErrors.complaint_description = "Complaint description is required";

    if (!formData.attachment_path) newErrors.attachment_path = "Attachment is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "attachment_path" && formData[key] !== null) data.append(key, formData[key]);
      });
      if (formData.attachment_path) data.append("attachment_path", formData.attachment_path);
      const token=localStorage.getItem("token")
      const response = await fetch(
        "http://localhost:3000/complaints/postComplaintMaster",
        { method: "POST", body: data,
          headers:{
          "Authorization": `Bearer ${token}`
  } }
      );
      if (response.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Complaint submitted",
          description: "Complaint created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setFormData({
          ticket_number: "",
          raised_by_type: "",
          raised_by_name: "",
          category: "",
          sub_category: "",
          department: "",
          priority: "",
          complaint_description: "",
          attachment_path: null,
        });
        setFileKey(Date.now());
        setFileName("");
      } else throw new Error(result.message || "Error");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="gray.50" minH="100vh" py={4}>
      <Container maxW="5xl">
        {/* Header */}
        <Box textAlign="center" mb={2}>
          <Heading
            size="2xl"
            mb={2}
            fontWeight="extrabold"
            bgGradient="linear(to-r, blue.400, teal.400)"
            bgClip="text"
          >
            Complaint Form
          </Heading>
          <Text color="gray.500" fontSize="md">
            Fill the details below to submit a complaint
          </Text>
        </Box>

        {/* Form Card */}
        <Box bg="white" p={10} borderRadius="3xl" boxShadow="2xl">
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <Input type="hidden" name="ticket_number" value={formData.ticket_number} onChange={handleChange} />

              {/* Raised By */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl isRequired isInvalid={!!errors.raised_by_type}>
                    <FormLabel>Raised By Type</FormLabel>
                    <Select
                      name="raised_by_type"
                      value={formData.raised_by_type}
                      onChange={handleChange}
                      placeholder="Select Type"
                      focusBorderColor="blue.400"
                      borderRadius="md"
                      boxShadow="sm"
                    >
                      <option value="EMPLOYEE">EMPLOYEE</option>
                      <option value="PATIENT">PATIENT</option>
                    </Select>
                    <FormErrorMessage>{errors.raised_by_type}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired isInvalid={!!errors.raised_by_name}>
                    <FormLabel>Raised By Name</FormLabel>
                    <Input
                      name="raised_by_name"
                      value={formData.raised_by_name}
                      onChange={handleChange}
                      placeholder="Enter Name"
                      focusBorderColor="blue.400"
                      borderRadius="md"
                      boxShadow="sm"
                    />
                    <FormErrorMessage>{errors.raised_by_name}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Employee Fields */}
              {formData.raised_by_type === "EMPLOYEE" && (
                <Box bg="gray.50" p={4} borderRadius="xl" boxShadow="inner">
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                    <GridItem>
                      <FormControl isRequired isInvalid={!!errors.category}>
                        <FormLabel>Category</FormLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          placeholder="Select Category"
                          focusBorderColor="blue.400"
                          borderRadius="md"
                        >
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                        </Select>
                        <FormErrorMessage>{errors.category}</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired isInvalid={!!errors.sub_category}>
                        <FormLabel>Sub Category</FormLabel>
                        <Input
                          name="sub_category"
                          value={formData.sub_category}
                          onChange={handleChange}
                          placeholder="Enter Sub Category"
                          focusBorderColor="blue.400"
                          borderRadius="md"
                        />
                        <FormErrorMessage>{errors.sub_category}</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
              )}

              {/* Department + Priority */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl isRequired isInvalid={!!errors.department}>
                    <FormLabel>Department</FormLabel>
                    <Select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Select Department"
                      focusBorderColor="blue.400"
                      borderRadius="md"
                    >
                      <option value="IT">IT</option>
                      <option value="Billing">Billing</option>
                      <option value="Administration">Administration</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Laboratory">Laboratory</option>
                    </Select>
                    <FormErrorMessage>{errors.department}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired isInvalid={!!errors.priority}>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      placeholder="Select Priority"
                      focusBorderColor="blue.400"
                      borderRadius="md"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </Select>
                    <FormErrorMessage>{errors.priority}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Complaint Description */}
              <FormControl isRequired isInvalid={!!errors.complaint_description}>
                <FormLabel>Complaint Description</FormLabel>
                <Textarea
                  name="complaint_description"
                  value={formData.complaint_description}
                  onChange={handleChange}
                  placeholder="Describe the complaint in detail"
                  resize="vertical"
                  minH="120px"
                  borderRadius="md"
                  focusBorderColor="blue.400"
                  boxShadow="sm"
                />
                <FormErrorMessage>{errors.complaint_description}</FormErrorMessage>
              </FormControl>

              {/* Attachment (Compact Button) */}
              <FormControl isRequired isInvalid={!!errors.attachment_path}>
                <FormLabel>Attachment</FormLabel>
                <Box>
                  <Input
                    key={fileKey}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    display="none"
                    id="attachment_input"
                  />
                  <Button
                    as="label"
                    htmlFor="attachment_input"
                    leftIcon={<AttachmentIcon />}
                    colorScheme="blue"
                  >
                    Choose File
                  </Button>
                  {fileName && (
                    <Badge ml={3} colorScheme="green">
                      {fileName}
                    </Badge>
                  )}
                </Box>
                <FormErrorMessage>{errors.attachment_path}</FormErrorMessage>
              </FormControl>

              {/* Submit Button */}
              <HStack justify="flex-end">
                <Button
                  colorScheme="blue"
                  size="lg"
                  type="submit"
                  bgGradient="linear(to-r, blue.400, teal.400)"
                  color="white"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                >
                  Submit Complaint
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </Container>
    </Box>
  );
}