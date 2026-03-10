import { useState, useEffect } from "react";

import {
  Flex,
  Box,
  Heading,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function RegisterPatient({  onSave }) {
  const toast = useToast();
      const navigate=useNavigate()


  const [tabIndex, setTabIndex] = useState(0);
  const [patients, setPatients] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: "",
    email: "",
    gender: "",
    dob: "",
    blood_group: "",
    contact_number: "",
    address: "",
    emergency_name: "",
    emergency_contact_number: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPatients();
  }, []);
  //

  const fetchPatients = async () => {
    try {
       const token=localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/patient/getPatients",{
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

      const result = await res.json();
      setPatients(result.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setPatients([]);
    }
  };

  // 🔥 Handle Input Change with real-time filtering
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🚫 Prevent letters in contact numbers
    if (name === "contact_number" || name === "emergency_contact_number") {
      if (!/^\d*$/.test(value)) return;
    }

    // 🚫 Prevent numbers & special chars in names
    if (name === "patient_name" || name === "emergency_name") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Validation Logic
  const validate = () => {
    let newErrors = {};

    if (!formData.patient_name.trim()) {
      newErrors.patient_name = "Patient Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Must be exactly 10 digits";
    }

    if (!formData.emergency_name.trim()) {
      newErrors.emergency_name = "Emergency contact name is required";
    }

    if (!formData.emergency_contact_number.trim()) {
      newErrors.emergency_contact_number = "Emergency number is required";
    } else if (!/^[0-9]{10}$/.test(formData.emergency_contact_number)) {
      newErrors.emergency_contact_number = "Must be exactly 10 digits";
    }

    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.blood_group)
      newErrors.blood_group = "Blood group is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      patient_name: "",
      email: "",
      gender: "",
      dob: "",
      blood_group: "",
      contact_number: "",
      address: "",
      emergency_name: "",
      emergency_contact_number: "",
    });
    setEditId(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const url = editId
      ? `http://localhost:3000/patient/updatePatient/${editId}`
      : "http://localhost:3000/patient/registerPatient";
    const method = editId ? "PUT" : "POST";
    try {
      setLoading(true);
        const token=localStorage.getItem("token")
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json",
          headers:{
          "Authorization": `Bearer ${token}`
  }
         },
        body: JSON.stringify(formData),
      });
if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const result = await res.json();

      toast({
        title: editId ? "Updated Successfully" : "Registered Successfully",
        status: "success",
        duration: 2000,
      });
      if (editId) {
        setPatients((prev) =>
          prev.map((p) =>
            p.patient_id === editId ? { ...p, ...formData } : p
          )
        );
      } else {
        setPatients((prev) => [result.data, ...prev]);
      }


      if (result?.data && typeof onSave === "function") {
        onSave(result.data, !!editId);
      }

      if (!editId) {
        fetchPatients();
      }

      resetForm();
    } catch (err) {
      toast({ title: "Operation Failed", status: "error", description: err });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      ...patient,
      dob: patient.dob ? patient.dob.split("T")[0] : "",
    });
    setEditId(patient.patient_id);
    setTabIndex(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
       const token=localStorage.getItem("token")
      const res=await fetch(`http://localhost:3000/patient/deletePatient/${id}`, {
        method: "DELETE",
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

      setPatients((prev) => prev.filter((p) => p.patient_id !== id));
      toast({ title: "Deleted Successfully", status: "success" });
    } catch (err) {
      toast({ title: "Delete Failed", status: "error", description: err });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={6}>
      <Box
        
        maxW="1000px"
        w="100%"
        p={6}
        bg="white"
        boxShadow="lg"
        borderRadius="xl"
      >
        <Tabs
          index={tabIndex}
          onChange={(i) => setTabIndex(i)}
          variant="enclosed"
        >
          <TabList>
            <Tab>Register Patient</Tab>
            <Tab>All Patients</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Heading size="md" mb={4}>
                {editId ? "Update Patient" : "Register Patient"}
              </Heading>

              <form onSubmit={handleSubmit}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <GridItem>
                    <FormControl isInvalid={!!errors.patient_name}>
                      <FormLabel>Patient Name *</FormLabel>
                      <Input
                        name="patient_name"
                        value={formData.patient_name}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel>Email *</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.gender}>
                      <FormLabel>Gender *</FormLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </Select>
                      <FormErrorMessage>{errors.gender}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.blood_group}>
                      <FormLabel>Blood Group *</FormLabel>
                      <Select
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                        <option>O+</option>
                        <option>O-</option>
                      </Select>
                      <FormErrorMessage>{errors.blood_group}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.dob}>
                      <FormLabel>Date of Birth *</FormLabel>
                      <Input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>{errors.dob}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.contact_number}>
                      <FormLabel>Contact Number *</FormLabel>
                      <Input
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        maxLength={10}
                      />
                      <FormErrorMessage>
                        {errors.contact_number}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={2}>
                    <FormControl isInvalid={!!errors.address}>
                      <FormLabel>Address *</FormLabel>
                      <Textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>{errors.address}</FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.emergency_name}>
                      <FormLabel>Emergency Contact Name *</FormLabel>
                      <Input
                        name="emergency_name"
                        value={formData.emergency_name}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>
                        {errors.emergency_name}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isInvalid={!!errors.emergency_contact_number}>
                      <FormLabel>Emergency Contact Number *</FormLabel>
                      <Input
                        name="emergency_contact_number"
                        value={formData.emergency_contact_number}
                        onChange={handleChange}
                        maxLength={10}
                      />
                      <FormErrorMessage>
                        {errors.emergency_contact_number}
                      </FormErrorMessage>
                    </FormControl>
                  </GridItem>
                </Grid>

                <Flex mt={6} gap={4}>
                  <Button colorScheme="blue" type="submit" isLoading={loading}>
                    {editId ? "Update" : "Register"}
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    onClick={resetForm}
                  >
                    Clear
                  </Button>
                </Flex>
              </form>
            </TabPanel>

            <TabPanel>
              {/* Table section remains same as your original, just wrapped in a Table variant */}
              <Table variant="simple">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Blood Group</Th>
                    <Th>Contact</Th>
                    <Th minW="200px">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {patients.map((p) => (
                    <Tr key={p.patient_id}>
                      <Td>{p.patient_id}</Td>
                      <Td>{p.patient_name}</Td>
                      <Td>{p.email}</Td>
                      <Td>{p.blood_group}</Td>
                      <Td>{p.contact_number}</Td>
                      <Td>
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEdit(p)}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(p.patient_id)}
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
}

export default RegisterPatient;