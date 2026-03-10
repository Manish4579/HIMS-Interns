import { useState, useEffect } from "react";
import {
  Flex,
  Box,
  Heading,
  Input,
  Select,
  Button,
  Grid,
  FormControl,
  FormLabel,
  FormErrorMessage, // Added for validation
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
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function Employee() {
  const toast = useToast();
  const navigate=useNavigate()

  const [tabIndex, setTabIndex] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to track errors

  const [formData, setFormData] = useState({
    employee_name: "",
    gender: "",
    dob: "",
    email: "",
    department: "",
    designation: "",
    qualification: "",
    experience_years: "",
    contact_number: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
       const token=localStorage.getItem("token")
     const res = await fetch("http://localhost:3000/api/employee/getEmployees",{
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
      setEmployees(result.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setEmployees([]);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    
    if (name === "contact_number") {
      if (!/^\d*$/.test(value)) return;
    }

    
    if (name === "employee_name") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    if(name === "qualification") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    if( name === "designation") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });

    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };


  const validate = () => {
    let newErrors = {};

    if (!formData.employee_name.trim()) {
      newErrors.employee_name = "Employee name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Enter a valid 10-digit number";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.experience_years) newErrors.experience_years = "Experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      employee_name: "",
      gender: "",
      dob: "",
      email: "",
      department: "",
      designation: "",
      qualification: "",
      experience_years: "",
      contact_number: "",
    });
    setEditId(null);
    setErrors({}); // Reset errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger validation
    if (!validate()) return;

    const url = editId
  ? `http://localhost:3000/api/employee/updateEmployee/${editId}`
  : "http://localhost:3000/api/employee/registerEmployee";

    const method = editId ? "PUT" : "POST";

    try {
      setLoading(true);
       const token=localStorage.getItem("token")
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" ,

          "Authorization": `Bearer ${token}`
  
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

      if (editId) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.employee_id === editId ? { ...emp, ...formData } : emp
          )
        );
      } else {
        setEmployees((prev) => [result.data, ...prev]);
      }

      toast({
        title: editId ? "Updated Successfully" : "Registered Successfully",
        status: "success",
        duration: 2000,
      });

      resetForm();
    } catch {
      toast({ title: "Operation Failed", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      ...emp,
      dob: emp.dob ? emp.dob.split("T")[0] : "",
    });
    setEditId(emp.employee_id);
    setTabIndex(0);
    setErrors({}); // Clear errors when editing
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const token=localStorage.getItem("token")
      const res=await fetch(`http://localhost:3000/api/employee/deleteEmployee/${id}`, {
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

      setEmployees((prev) =>
        prev.filter((emp) => emp.employee_id !== id)
      );

      toast({
        title: "Deleted Successfully",
        status: "info",
        duration: 2000,
      });
    } catch {
      toast({ title: "Delete Failed", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={6}>
      <Box  maxW="1100px" w="100%" p={6} bg="white" boxShadow="lg" borderRadius="xl">
        <Tabs index={tabIndex} onChange={(i) => setTabIndex(i)} variant="enclosed">
          <TabList>
            <Tab>Register Employee</Tab>
            <Tab>All Employees</Tab>
          </TabList>

          <TabPanels>
            {/* FORM TAB */}
            <TabPanel>
              <Heading size="md" mb={4}>
                {editId ? "Update Employee" : "Register Employee"}
              </Heading>

              <form onSubmit={handleSubmit}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <FormControl isRequired isInvalid={!!errors.employee_name}>
                    <FormLabel>Name</FormLabel>
                    <Input 
                      name="employee_name" 
                      value={formData.employee_name} 
                      onChange={handleChange} 
                    />
                    <FormErrorMessage>{errors.employee_name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.gender}>
                    <FormLabel>Gender</FormLabel>
                    <Select name="gender" value={formData.gender} onChange={handleChange} placeholder="Select gender">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </Select>
                    <FormErrorMessage>{errors.gender}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.dob}>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    <FormErrorMessage>{errors.dob}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.department}>
                    <FormLabel>Department</FormLabel>
                    <Select name="department" value={formData.department} onChange={handleChange} placeholder="Select department">
                      <option>HR</option>
                      <option>Doctor</option>
                      <option>Nurse</option>
                      <option>Admin</option>
                    </Select>
                    <FormErrorMessage>{errors.department}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.designation}>
                    <FormLabel>Designation</FormLabel>
                    <Input name="designation" value={formData.designation} onChange={handleChange} />
                    <FormErrorMessage>{errors.designation}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.qualification}>
                    <FormLabel>Qualification</FormLabel>
                    <Input name="qualification" value={formData.qualification} onChange={handleChange} />
                    <FormErrorMessage>{errors.qualification}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.experience_years}>
                    <FormLabel>Experience (Years)</FormLabel>
                    <Input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} />
                    <FormErrorMessage>{errors.experience_years}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.contact_number}>
                    <FormLabel>Contact</FormLabel>
                    <Input 
                      name="contact_number" 
                      value={formData.contact_number} 
                      onChange={handleChange} 
                      maxLength={10}
                    />
                    <FormErrorMessage>{errors.contact_number}</FormErrorMessage>
                  </FormControl>
                </Grid>

                <Flex mt={6} gap={4}>
                  <Button colorScheme="blue" type="submit" isLoading={loading}>
                    {editId ? "Update" : "Register"}
                  </Button>

                  <Button variant="outline" colorScheme="blue" onClick={resetForm}>
                    Clear
                  </Button>
                </Flex>
              </form>
            </TabPanel>

            {/* LIST TAB */}
            <TabPanel>
              <Table variant="simple">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>ID</Th>
                    <Th>Name</Th>
                    <Th>Designation</Th>
                    <Th>DOB</Th>
                    <Th>Department</Th>
                    <Th>Contact</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {employees.map((e) => (
                    <Tr key={e.employee_id}>
                      <Td>{e.employee_id}</Td>
                      <Td fontWeight="bold">{e.employee_name}</Td>
                      <Td>{e.designation}</Td>
                      <Td>{e.dob}</Td>
                      <Td>{e.department}</Td>
                      <Td>{e.contact_number}</Td>

                      <Td textAlign="center">
                        <Flex justify="center" gap={3}>
                          <Button size="sm" colorScheme="blue" onClick={() => handleEdit(e)}>
                            Update
                          </Button>

                          <Button size="sm" colorScheme="red" onClick={() => handleDelete(e.employee_id)}>
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

export default Employee;