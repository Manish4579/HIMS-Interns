import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  useToast,
  Flex,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import RegisterPatient from "./registerPatient";
import { useNavigate } from "react-router-dom";

function PatientRecords() {
      const navigate=useNavigate()

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

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
      console.error("Failed to fetch patients", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
       const token=localStorage.getItem("token")
      const res = await fetch(
        `http://localhost:3000/patient/deletePatient/${id}`,
        { method: "DELETE",headers:{
          "Authorization": `Bearer ${token}`
  } },
      );
      if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}


      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p.patient_id !== id));

        toast({
          title: "Record Deleted",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not delete",
        status: "error",
      });
    }
  };

  const handleSave = (updatedPatient, isEdit) => {
    if (isEdit) {
      setPatients((prev) =>
        prev.map((p) =>
          p.patient_id === updatedPatient.patient_id ? updatedPatient : p,
        ),
      );
    }
  };

  /* UPDATE CLICK */
  const handleUpdateClick = (patient) => {
    setSelectedPatient(patient);
    setTabIndex(0);
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Flex direction="column" align="center">
        <Box
          w="100%"
          maxW="1000px"
          bg="white"
          p={6}
          borderRadius="xl"
          shadow="md"
        >
          <Heading size="lg" mb={6} textAlign="center">
            Hospital Records
          </Heading>

          <Tabs
            index={tabIndex}
            onChange={(i) => setTabIndex(i)}
            variant="soft-rounded"
            colorScheme="blue"
            isFitted
          >
            

            <TabPanels>
              <TabPanel>
                <RegisterPatient
                  selectedPatient={selectedPatient}
                  onSave={handleSave}
                />
              </TabPanel>

              <TabPanel>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Contact</Th>
                        <Th>Blood Group</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {patients.map((p) => (
                        <Tr key={p.patient_id}>
                          <Td fontWeight="bold">{p.patient_name}</Td>
                          <Td>{p.contact_number}</Td>
                          <Td>
                            <Badge colorScheme="red">{p.blood_group}</Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              mr={2}
                              onClick={() => handleUpdateClick(p)}
                            >
                              Update
                            </Button>

                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(p.patient_id)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Box>
  );
}

export default PatientRecords;