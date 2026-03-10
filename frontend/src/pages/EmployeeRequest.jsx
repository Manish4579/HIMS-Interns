import { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  Button,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";


function EmployeeRequest() {
  const toast = useToast();
    const navigate=useNavigate()

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    request_number: "",
    request_category: "",
    request_title: "",
    requirement_description: "",
    related_module: "",
    existing_feature_ref: "",
    priority: "",
    attachment: null,
  });

  const [errors, setErrors] = useState({});
  const [nextSequence, setNextSequence] = useState("001");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchNextRequestNumber();
  }, []);

  const fetchNextRequestNumber = async () => {
    try {
       const token=localStorage.getItem("token")
      const res = await fetch(
        "http://localhost:3000/request/getNextRequestNumber",{
          headers:{
          "Authorization": `Bearer ${token}`
  }
        }
      );

     if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}


      const data = await res.json();
      const sequence = data.next_sequence || "001";

      setNextSequence(sequence);

      setFormData((prev) => ({
        ...prev,
        request_number: sequence,
      }));
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const resetFormToDefault = (category = "") => {
    let previewNumber = nextSequence;

    if (category === "CR") {
      previewNumber = `CR-${currentYear}-${nextSequence}`;
    } else if (category === "AR") {
      previewNumber = `AR-${currentYear}-${nextSequence}`;
    }

    setFormData({
      request_number: previewNumber,
      request_category: category,
      request_title: "",
      requirement_description: "",
      related_module: "",
      existing_feature_ref: "",
      priority: "",
      attachment: null,
    });

    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "attachment") {
      setFormData({ ...formData, attachment: e.target.files[0] });
      return;
    }

    if (name === "request_category") {
      resetFormToDefault(value);
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.request_category)
      newErrors.request_category = "Category is required";

    if (!formData.request_title)
      newErrors.request_title = "Title is required";

    if (!formData.requirement_description)
      newErrors.requirement_description = "Description is required";

    if (
      formData.request_category === "CR" &&
      !formData.related_module
    ) {
      newErrors.related_module =
        "Related Module is required for Change Request";
    }

    if (
      formData.request_category === "CR" &&
      !formData.existing_feature_ref
    ) {
      newErrors.existing_feature_ref =
        "Existing Feature Reference is required for CR";
    }

    if (!formData.priority)
      newErrors.priority = "Priority is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
       const token=localStorage.getItem("token")
      const res = await fetch(
        "http://localhost:3000/request/postRequest",
        {
          method: "POST",
          body: formDataToSend,
          headers:{
          "Authorization": `Bearer ${token}`
  }

        }
      );
      if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}


      if (res.ok) {
        toast({
          title: "Request Submitted",
          description: "Request submitted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        resetFormToDefault("");
        fetchNextRequestNumber();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      console.error("API Error:", error);

      toast({
        title: "Submission Failed",
        description: "Unable to submit request",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100" p={6}>
      <Box
        ml={{ base: 0, ml: "250px" }}
        maxW="1000px"
        w="100%"
        bg="white"
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow="xl"
      >
        <Heading size="lg" mb={2}>
          Request (Employee)
        </Heading>

        <Text color="gray.500" mb={6}>
          Raise Change Requests / Additional Requirements
        </Text>

        <form onSubmit={handleSubmit}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={6}
          >
            <GridItem>
              <FormControl>
                <FormLabel>Request Number</FormLabel>
                <Input
                  value={formData.request_number}
                  isReadOnly
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl
                isRequired
                isInvalid={errors.request_category}
              >
                <FormLabel>Request Category</FormLabel>
                <Select
                  name="request_category"
                  placeholder="Select CR / AR"
                  value={formData.request_category}
                  onChange={handleChange}
                >
                  <option value="CR">Change Request (CR)</option>
                  <option value="AR">
                    Additional Requirement (AR)
                  </option>
                </Select>
                <FormErrorMessage>
                  {errors.request_category}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl
                isRequired
                isInvalid={errors.request_title}
              >
                <FormLabel>Request Title</FormLabel>
                <Input
                  name="request_title"
                  value={formData.request_title}
                  onChange={handleChange}
                />
                <FormErrorMessage>
                  {errors.request_title}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            {formData.request_category === "CR" && (
              <GridItem>
                <FormControl
                  isRequired
                  isInvalid={errors.related_module}
                >
                  <FormLabel>Related Module</FormLabel>
                  <Select
                    name="related_module"
                    placeholder="Select Related Module"
                    value={formData.related_module}
                    onChange={handleChange}
                  >
                    <option value="Billing">Billing</option>
                  </Select>
                  <FormErrorMessage>
                    {errors.related_module}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            )}

            {formData.request_category === "CR" && (
              <GridItem>
                <FormControl
                  isRequired
                  isInvalid={errors.existing_feature_ref}
                >
                  <FormLabel>Existing Feature Ref</FormLabel>
                  <Input
                    name="existing_feature_ref"
                    value={formData.existing_feature_ref}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>
                    {errors.existing_feature_ref}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            )}

            <GridItem colSpan={{ base: 1, md: 2 }}>
              <FormControl
                isRequired
                isInvalid={errors.requirement_description}
              >
                <FormLabel>Requirement Description</FormLabel>
                <Textarea
                  name="requirement_description"
                  placeholder="Describe the change request or additional requirement in detail"
                  value={formData.requirement_description}
                  onChange={handleChange}
                  rows={4}
                />
                <FormErrorMessage>
                  {errors.requirement_description}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl
                isRequired
                isInvalid={errors.priority}
              >
                <FormLabel>Priority</FormLabel>
                <Select
                  name="priority"
                  placeholder="Select Priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </Select>
                <FormErrorMessage>
                  {errors.priority}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Attachment (Optional)</FormLabel>
                <Input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                />
              </FormControl>
            </GridItem>
          </Grid>

          <Button
            mt={6}
            colorScheme="blue"
            type="submit"
            isLoading={loading}
          >
            Submit Request
          </Button>
        </form>
      </Box>
    </Flex>
  );
}

export default EmployeeRequest;