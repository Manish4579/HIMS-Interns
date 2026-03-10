import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Input,
  List,
  ListItem,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  InputGroup,
  InputRightElement,
  useToast,
  Checkbox,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";

// Helper component for displaying a section
const DataCard = ({ title, children }) => (
  <Card variant="outline">
    <CardHeader bg="gray.50" borderBottomWidth="1px">
      <Heading size="sm" color="blue.700">
        {title}
      </Heading>
    </CardHeader>
    <CardBody>{children}</CardBody>
  </Card>
);

// Helper for key-value pairs
const InfoItem = ({ label, value }) => (
  <Box>
    <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase">
      {label}
    </Text>
    <Text>{value || "N/A"}</Text>
  </Box>
);

const formatTimestamp = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const CardiologyList = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]); // Stores recent 5 patients
  const [searchResults, setSearchResults] = useState([]); // Stores search dropdown results
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [cardiologyData, setCardiologyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  // Initial Load: Fetch recent patients and timestamps
  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        // 1. Fetch cardiology patients
        const res = await fetch("http://localhost:3000/api/cardiology/patients/search?search=");
        const data = await res.json();

        if (data.success) {
          let patientsList = data.data;
          console.log(patientsList);
          

          // 2. Fetch all patients to get created_at timestamps
          try {
            const allRes = await fetch("http://localhost:3000/patient/getPatients");
            const allData = await allRes.json();
            if (allData.success) {
              const timestampMap = {};
              allData.data.forEach((p) => {
                timestampMap[p.patient_id] = p.created_at;
              });

              patientsList = patientsList.map((p) => ({
                ...p,
                created_at: timestampMap[p.patient_id],
              }));
            }
          } catch (tsError) {
            console.warn("Failed to fetch timestamps", tsError);
          }

          // 3. Sort by created_at descending and take top 5
          patientsList.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            const valA = isNaN(timeA) ? 0 : timeA;
            const valB = isNaN(timeB) ? 0 : timeB;
            return valB - valA;
          });
          setPatients(patientsList.slice(0, 5));
          setAllPatients(patientsList);
        }
      } catch (err) {
        console.error("Error fetching recent patients:", err);
      }
    };

    fetchRecentPatients();
  }, []);

  // Search Effect
  useEffect(() => {
    if (search.trim() === "" || search.length < 2) {
      // Don't search for short/empty strings; let onFocus/onChange handle the full list.
      // Do not clear searchResults here, to keep the full list visible.
      return;
    }

    // If the search matches the selected patient, don't trigger search
    if (selectedPatient && search === selectedPatient.patient_name) {
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:3000/api/cardiology/patients/search?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [search, selectedPatient]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() === "") {
      setSearchResults(allPatients); // Show all patients if search is cleared
    }
  };

  const handleFocus = () => {
    // Show all patients when the search bar is clicked/focused
    setSearchResults(allPatients);
  };

  const handleBlur = () => {
    // Use a timeout to allow click events on the list to fire before hiding it
    setTimeout(() => {
      setSearchResults([]);
    }, 200);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchResults([]);
    setSelectedPatient(null);
    setCardiologyData(null);
    setError("");
  };

  const fetchCardiology = async (patient) => {
    setSelectedPatient(patient);
    setSearch(patient.patient_name); // Fill search bar with selected patient
    setSearchResults([]); // Hide dropdown
    setIsLoading(true);
    setError("");
    setCardiologyData(null);

    try {
      const res = await fetch(`http://localhost:3000/api/cardiology/patients/${patient.patient_id}/cardiology`);
      const data = await res.json();

      if (data.success && data.data) {
        setCardiologyData(data.data);
      } else if (!data.data) {
        setError("No cardiology records found for this patient.");
        toast({
          title: "No Records",
          description: "No cardiology records found for this patient.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message || "Failed to fetch cardiology data");
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract ordered tests for checkboxes
  const orderedTests = cardiologyData?.orderedInvestigations?.map((t) => t.test_name) || [];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading color="medical.700">Cardiology Patient Records</Heading>

        {/* Search Bar */}
        <Box position="relative">
          <InputGroup>
            <Input
              placeholder="Search patient by name or ID..."
              value={search}
              onChange={handleSearchChange}
              size="lg"
              boxShadow="sm"
              bg="white"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <InputRightElement>
              {isSearching ? (
                <Spinner size="sm" color="blue.500" />
              ) : search ? (
                <IconButton
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                />
              ) : (
                <SearchIcon color="gray.400" />
              )}
            </InputRightElement>
          </InputGroup>

          {/* Search Dropdown */}
          {searchResults.length > 0 && !selectedPatient && (
            <List position="absolute" top="100%" left={0} right={0} bg="white" boxShadow="lg" borderRadius="md" zIndex={10} maxH="300px" overflowY="auto" mt={1} border="1px solid" borderColor="gray.200">
              {searchResults.map((patient) => (
                <ListItem key={patient.patient_id} p={3} cursor="pointer" _hover={{ bg: "blue.50" }} onClick={() => fetchCardiology(patient)}>
                  <Text fontWeight="bold">{patient.patient_name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    ID: {patient.patient_id}
                  </Text>
                </ListItem>
              ))}
            </List>
          )}

        </Box>

        {/* Content Area */}
        <Box>
          {isLoading && (
            <VStack justify="center" h="200px">
              <Spinner size="xl" color="blue.500" />
              <Text>Loading Cardiology Data...</Text>
            </VStack>
          )}

          {error && !isLoading && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!selectedPatient && !isLoading && !error && (
            <Box mt={4}>
              <Heading size="md" mb={4} color="gray.600">Recent Patients</Heading>
              {patients.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {patients.map((patient) => (
                    <Card
                      key={patient.patient_id}
                      cursor="pointer"
                      onClick={() => fetchCardiology(patient)}
                      _hover={{ shadow: "md", borderColor: "blue.300" }}
                      variant="outline"
                    >
                      <CardBody>
                        <Text fontWeight="bold" fontSize="lg">{patient.patient_name}</Text>
                        <Text fontSize="sm" color="gray.500">Patient ID: {patient.patient_id}</Text>
                        <Text fontSize="xs" color="gray.400" mt={2}>
                          Created: {formatTimestamp(patient.measured_at)}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Text color="gray.500">No recent patients found.</Text>
              )}
            </Box>
          )}

          {cardiologyData && selectedPatient && (
            <VStack spacing={6} align="stretch">
              <DataCard title="Patient Information">
                 <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                   <InfoItem label="Patient Name" value={cardiologyData.patient?.patient_name} />
                   <InfoItem label="Patient ID" value={cardiologyData.patient?.patient_id} />
                   <InfoItem label="Age" value={cardiologyData.patient?.age} />
                   <InfoItem label="Gender" value={cardiologyData.patient?.gender} />
                   <InfoItem label="Contact" value={cardiologyData.patient?.contact_number} />
              </SimpleGrid>
             </DataCard>

              <DataCard title="Vital Signs">
                <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                  <InfoItem label="BP" value={cardiologyData.vitalSigns?.bp} />
                  <InfoItem label="HR" value={cardiologyData.vitalSigns?.hr} />
                  <InfoItem label="RR" value={cardiologyData.vitalSigns?.rr} />
                  <InfoItem label="Temp" value={cardiologyData.vitalSigns?.temperature ? `${cardiologyData.vitalSigns.temperature}°C` : "N/A"} />
                  <InfoItem label="BMI" value={cardiologyData.vitalSigns?.bmi} />
                </SimpleGrid>
              </DataCard>

              <DataCard title="Medical History">
                <VStack spacing={4} align="stretch">
                  <InfoItem label="Allergies" value={cardiologyData.medicalHistory?.allergies} />
                  <InfoItem label="Past Medical History" value={cardiologyData.medicalHistory?.past_medical_history} />
                  <InfoItem label="Past Surgical History" value={cardiologyData.medicalHistory?.past_surgical_history} />
                  <InfoItem label="Family History" value={cardiologyData.medicalHistory?.family_history} />
                  <InfoItem label="Social History" value={cardiologyData.medicalHistory?.social_history} />
                </VStack>
              </DataCard>

              <DataCard title="Symptoms">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <InfoItem label="Chest Pain" value={cardiologyData.symptoms?.chest_pain} />
                  <InfoItem label="Dyspnea" value={cardiologyData.symptoms?.dyspnea} />
                  <InfoItem label="Orthopnea" value={cardiologyData.symptoms?.orthopnea} />
                  <InfoItem label="PND" value={cardiologyData.symptoms?.pnd} />
                  <InfoItem label="Palpitations" value={cardiologyData.symptoms?.palpitations} />
                  <InfoItem label="Syncope" value={cardiologyData.symptoms?.syncope} />
                  <InfoItem label="Edema" value={cardiologyData.symptoms?.edema} />
                  <InfoItem label="Fatigue" value={cardiologyData.symptoms?.fatigue} />
                  <InfoItem label="Other Symptoms" value={cardiologyData.symptoms?.other_symptoms} />
                </SimpleGrid>
              </DataCard>

              <DataCard title="Preliminary Diagnosis">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <InfoItem label="Suspected Condition" value={cardiologyData.preliminaryDiagnosis?.suspected_condition} />
                  <InfoItem label="Risk Level" value={cardiologyData.preliminaryDiagnosis?.risk_level} />
                </SimpleGrid>
              </DataCard>

              <DataCard title="Ordered Investigations">
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.600">Laboratory Tests</Text>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                      {["CBC", "BNP", "Electrolytes", "Thyroid Function Tests", "Lipid Profile", "D-Dimer", "Liver Function Tests", "Troponin", "CRP", "Renal Function Tests"].map((test) => (
                        <Checkbox key={test} isChecked={orderedTests.includes(test)} isReadOnly isDisabled colorScheme="blue">
                          {test}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.600">Imaging & Diagnostic Tests</Text>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                      {["ECG", "Holter Monitor", "Chest X-Ray", "Echocardiography", "Cardiac MRI", "Coronary Angiography", "Stress Test", "Cardiac CT"].map((test) => (
                        <Checkbox key={test} isChecked={orderedTests.includes(test)} isReadOnly isDisabled colorScheme="blue">
                          {test}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </Box>
                </VStack>
              </DataCard>

              <DataCard title="Investigation Results">
                <VStack spacing={4} align="stretch">
                  <InfoItem label="ECG Findings" value={cardiologyData.investigationResults?.ecg_findings} />
                  <InfoItem label="Echocardiography Findings" value={cardiologyData.investigationResults?.echo_findings} />
                  <InfoItem label="Lab Results" value={cardiologyData.investigationResults?.lab_results} />
                  <InfoItem label="Imaging Results" value={cardiologyData.investigationResults?.imaging_results} />
                  <InfoItem label="Other Findings" value={cardiologyData.investigationResults?.other_findings} />
                </VStack>
              </DataCard>

              <DataCard title="Final Diagnosis">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <InfoItem label="Primary Diagnosis" value={cardiologyData.finalDiagnosis?.primary_diagnosis} />
                  <InfoItem label="ICD Code" value={cardiologyData.finalDiagnosis?.icd_code} />
                  <InfoItem label="Severity" value={cardiologyData.finalDiagnosis?.severity} />
                  <InfoItem label="Comorbidities" value={cardiologyData.finalDiagnosis?.comorbidities} />
                </SimpleGrid>
              </DataCard>

              <DataCard title="Medications">
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Dose</Th>
                        <Th>Route</Th>
                        <Th>Frequency</Th>
                        <Th>Duration</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cardiologyData.medications?.length > 0 ? (
                        cardiologyData.medications.map((med, i) => (
                          <Tr key={i}>
                            <Td>{med.name}</Td>
                            <Td>{med.dose}</Td>
                            <Td>{med.route}</Td>
                            <Td>{med.frequency}</Td>
                            <Td>{med.duration}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={5}>No medications recorded.</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </DataCard>

              <DataCard title="Procedures">
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Indication</Th>
                        <Th>Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {cardiologyData.procedures?.length > 0 ? (
                        cardiologyData.procedures.map((proc, i) => (
                          <Tr key={i}>
                            <Td>{proc.name}</Td>
                            <Td>{proc.indication}</Td>
                            <Td>{proc.notes}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={3}>No procedures recorded.</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </DataCard>

              <DataCard title="Management Notes">
                <VStack spacing={4} align="stretch">
                  <InfoItem label="Lifestyle Advice" value={cardiologyData.managementNotes?.lifestyle_advice} />
                  <InfoItem label="Follow-Up" value={cardiologyData.managementNotes?.follow_up} />
                  <InfoItem label="Warning Signs" value={cardiologyData.managementNotes?.warning_signs} />
                </VStack>
              </DataCard>

              <DataCard title="Physician Notes">
                <VStack spacing={4} align="stretch">
                  <InfoItem label="Physician Notes" value={cardiologyData.physicianNotes?.physician_notes} />
                  <InfoItem label="Patient Questions" value={cardiologyData.physicianNotes?.patient_questions} />
                  <InfoItem label="Action Items" value={cardiologyData.physicianNotes?.action_items} />
                </VStack>
              </DataCard>
            </VStack>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default CardiologyList;