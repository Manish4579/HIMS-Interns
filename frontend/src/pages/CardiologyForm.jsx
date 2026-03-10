import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    FormErrorMessage,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Checkbox,
    Button,
    VStack,
    HStack,
    SimpleGrid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardBody,
    CardHeader,
    Divider,
    IconButton,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CardiologyForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [errors, setErrors] = useState({});

    // Static options for dropdowns
    const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
    const riskLevelOptions = ["Low", "Moderate", "High", "Critical"];
    const labTestOptions = [
        "CBC",
        "Lipid Profile",
        "Troponin",
        "BNP",
        "D-Dimer",
        "CRP",
        "Electrolytes",
        "Liver Function Tests",
        "Renal Function Tests",
        "Thyroid Function Tests",
    ];
    const imagingTestOptions = [
        "ECG",
        "Echocardiography",
        "Stress Test",
        "Holter Monitor",
        "Cardiac MRI",
        "Cardiac CT",
        "Chest X-Ray",
        "Coronary Angiography",
    ];
    const severityOptions = [
        "Mild",
        "Moderate",
        "Severe",
        "Stage I",
        "Stage II",
        "Stage III",
        "Stage IV",
    ];

    // Initial empty state for reset
    const initialFormData = {
        patient_id: null,
        patientName: "",
        age: "",
        gender: "",
        contact: "",
        height: "",
        weight: "",
        bmi: "",
        bp: "",
        hr: "",
        rr: "",
        temperature: "",
        allergies: "",
        pastMedicalHistory: "",
        pastSurgicalHistory: "",
        familyHistory: "",
        socialHistory: "",
        chestPain: "",
        dyspnea: "",
        orthopnea: "",
        pnd: "",
        palpitations: "",
        syncope: "",
        edema: "",
        fatigue: "",
        otherSymptoms: "",
        suspectedCondition: "",
        riskLevel: "",
        labTests: [],
        imagingTests: [],
        otherTests: [],
        ecgFindings: "",
        echoFindings: "",
        labResults: "",
        imagingResults: "",
        otherFindings: "",
        primaryDiagnosis: "",
        icdCode: "",
        severity: "",
        comorbidities: "",
        medications: [],
        procedures: [],
        lifestyleAdvice: "",
        followUp: "",
        warningSigns: "",
        physicianNotes: "",
        patientQuestions: "",
        actionItems: "",
    };

    // Start with empty data
    const [formData, setFormData] = useState(initialFormData);

    const resetForm = () => {
        setFormData(initialFormData);
        setActiveTab(0);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            const arr = formData[name] || [];
            if (checked) {
                setFormData({ ...formData, [name]: [...arr, value] });
            } else {
                setFormData({ ...formData, [name]: arr.filter(item => item !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
        // Clear error for the field being changed
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleArrayChange = (index, field, value, arrayName) => {
        const updatedArray = [...formData[arrayName]];
        updatedArray[index][field] = value;
        setFormData({ ...formData, [arrayName]: updatedArray });
    };

    const addArrayItem = (arrayName, template) => {
        setFormData({ ...formData, [arrayName]: [...formData[arrayName], template] });
    };

    const removeArrayItem = (index, arrayName) => {
        const updatedArray = formData[arrayName].filter((_, i) => i !== index);
        setFormData({ ...formData, [arrayName]: updatedArray });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.patientName || formData.patientName.trim().length < 3) {
            newErrors.patientName = "Patient name must be at least 3 characters.";
        }
        if (!formData.contact || !/^[0-9]{10}$/.test(formData.contact.trim())) {
            newErrors.contact = "A valid 10-digit contact number is required.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please correct the errors before submitting.");
            return;
        }

        setIsSubmitting(true);

        const api = axios.create({
            baseURL: "http://localhost:3000/api/cardiology",
            timeout: 15000,
        });

        try {
            // 1. Save core patient data (demographics + height/weight/age)
            const patientPayload = {
                patient_name: formData.patientName,
                age: Number(formData.age) || null,
                gender: formData.gender,
                contact_number: formData.contact,  // ← fixed to match backend
                height: Number(formData.height) || null,
                weight: Number(formData.weight) || null,
            };

            let patientRes;
            if (formData.patient_id) {
                patientRes = await api.patch(`/patients/${formData.patient_id}`, patientPayload);
            } else {
                patientRes = await api.post("/patients", patientPayload);
            }

            const patientId = patientRes.data.data.patient_id;
            setFormData(prev => ({ ...prev, patient_id: patientId }));

            // 2. Save Vital Signs
            await api.patch(`/patients/${patientId}/vital-signs`, {
                bp: formData.bp,
                hr: Number(formData.hr) || null,
                rr: Number(formData.rr) || null,
                temperature: Number(formData.temperature) || null,
                bmi: Number(formData.bmi) || null,
            });

            // 3. Save Medical History
            await api.patch(`/patients/${patientId}/medical-history`, {
                allergies: formData.allergies,
                past_medical_history: formData.pastMedicalHistory,
                past_surgical_history: formData.pastSurgicalHistory,
                family_history: formData.familyHistory,
                social_history: formData.socialHistory,
            });

            // 4. Save Symptoms
            await api.patch(`/patients/${patientId}/symptoms`, {
                chest_pain: formData.chestPain,
                dyspnea: formData.dyspnea,
                orthopnea: formData.orthopnea,
                pnd: formData.pnd,
                palpitations: formData.palpitations,
                syncope: formData.syncope,
                edema: formData.edema,
                fatigue: formData.fatigue,
                other_symptoms: formData.otherSymptoms,
            });

            // 5. Save Preliminary Diagnosis
            await api.patch(`/patients/${patientId}/preliminary-diagnosis`, {
                suspected_condition: formData.suspectedCondition,
                risk_level: formData.riskLevel,
            });

            // 6. Save Ordered Investigations
            const allTests = [
                ...formData.labTests.map(name => ({ test_type: "lab", test_name: name })),
                ...formData.imagingTests.map(name => ({ test_type: "imaging", test_name: name })),
            ];
            for (const test of allTests) {
                await api.post(`/patients/${patientId}/ordered-investigations`, test);
            }

            // 7. Save Investigation Results
            await api.patch(`/patients/${patientId}/investigation-results`, {
                ecg_findings: formData.ecgFindings,
                echo_findings: formData.echoFindings,
                lab_results: formData.labResults,
                imaging_results: formData.imagingResults,
                other_findings: formData.otherFindings,
            });

            // 8. Save Final Diagnosis
            await api.patch(`/patients/${patientId}/final-diagnosis`, {
                primary_diagnosis: formData.primaryDiagnosis,
                icd_code: formData.icdCode,
                severity: formData.severity,
                comorbidities: formData.comorbidities,
            });

            // 9. Save Medications
            for (const med of formData.medications) {
                if (med.name?.trim()) {
                    await api.post(`/patients/${patientId}/medications`, {
                        name: med.name,
                        dose: med.dose || null,
                        route: med.route || null,
                        frequency: med.frequency || null,
                        duration: med.duration || null,
                    });
                }
            }

            // 10. Save Procedures
            for (const proc of formData.procedures) {
                if (proc.name?.trim()) {
                    await api.post(`/patients/${patientId}/procedures`, {
                        name: proc.name,
                        indication: proc.indication || null,
                        notes: proc.notes || null,
                    });
                }
            }

            // 11. Save Management Notes
            await api.patch(`/patients/${patientId}/management-notes`, {
                lifestyle_advice: formData.lifestyleAdvice,
                follow_up: formData.followUp,
                warning_signs: formData.warningSigns,
            });

            // 12. Save Physician Notes
            await api.patch(`/patients/${patientId}/physician-notes`, {
                physician_notes: formData.physicianNotes,
                patient_questions: formData.patientQuestions,
                action_items: formData.actionItems,
            });

            toast.success("Form submitted successfully! All data saved.");

            // Clear form
            resetForm();

        } catch (error) {
            console.error("Submission error:", error);
            let errorMessage = "Submission failed!";
            if (error.response) {
                errorMessage = error.response.data?.message ||
                    `Endpoint ${error.config?.url || 'unknown'} failed: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = "No response from server. Is the backend running?";
            } else {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextTab = () => {
        setActiveTab((prev) => Math.min(prev + 1, 7));
    };

    const handlePrevTab = () => {
        setActiveTab((prev) => Math.max(prev - 1, 0));
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Box textAlign="start">
                    <Heading color="medical.700" mb={2}>Cardiology Encounter Form</Heading>
                    <Text color="gray.600">Comprehensive patient assessment and management tool</Text>
                </Box>

                <Card>
                    <CardBody>
                        <Tabs index={activeTab} onChange={setActiveTab} isLazy>
                            <TabList overflowX="auto" overflowY="hidden">
                                <Tab>Patient Info</Tab>
                                <Tab>Symptoms</Tab>
                                <Tab>Preliminary Dx</Tab>
                                <Tab>Investigations</Tab>
                                <Tab>Analysis</Tab>
                                <Tab>Final Dx</Tab>
                                <Tab>Management</Tab>
                                <Tab>Physician Notes</Tab>
                            </TabList>

                            <TabPanels>
                                {/* TAB 1: Patient Information */}
                                <TabPanel>
                                    <Card variant="outline" mb={6}>
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Patient Demographics</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                <FormControl isInvalid={!!errors.patientName}>
                                                    <FormLabel>Patient Name</FormLabel>
                                                    <Input
                                                        name="patientName"
                                                        value={formData.patientName}
                                                        onChange={handleChange}
                                                        placeholder="Full Name"
                                                    />
                                                    <FormErrorMessage>{errors.patientName}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Age</FormLabel>
                                                    <NumberInput value={formData.age} min={0} max={150}>
                                                        <NumberInputField
                                                            name="age"
                                                            onChange={handleChange}
                                                            placeholder="Age"
                                                        />
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select Gender</option>
                                                        {genderOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <FormControl isInvalid={!!errors.contact}>
                                                    <FormLabel>Contact Info</FormLabel>
                                                    <Input
                                                        name="contact"
                                                        value={formData.contact}
                                                        onChange={handleChange}
                                                         placeholder="10-digit phone number"
                                                    />
                                                    <FormErrorMessage>{errors.contact}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Height (cm)</FormLabel>
                                                    <NumberInput value={formData.height} min={0} max={300}>
                                                        <NumberInputField
                                                            name="height"
                                                            onChange={handleChange}
                                                            placeholder="Height"
                                                        />
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Weight (kg)</FormLabel>
                                                    <NumberInput value={formData.weight} min={0} max={300}>
                                                        <NumberInputField
                                                            name="weight"
                                                            onChange={handleChange}
                                                            placeholder="Weight"
                                                        />
                                                    </NumberInput>
                                                </FormControl>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>

                                    <Card variant="outline" mb={6}>
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Vital Signs</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel>Blood Pressure</FormLabel>
                                                    <Input
                                                        name="bp"
                                                        value={formData.bp}
                                                        onChange={handleChange}
                                                        placeholder="BP"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Heart Rate</FormLabel>
                                                    <Input
                                                        name="hr"
                                                        value={formData.hr}
                                                        onChange={handleChange}
                                                        placeholder="HR"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Respiratory Rate</FormLabel>
                                                    <Input
                                                        name="rr"
                                                        value={formData.rr}
                                                        onChange={handleChange}
                                                        placeholder="RR"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Temperature (°C)</FormLabel>
                                                    <Input
                                                        name="temperature"
                                                        value={formData.temperature}
                                                        onChange={handleChange}
                                                        placeholder="Temp"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>BMI</FormLabel>
                                                    <Input
                                                        name="bmi"
                                                        value={formData.bmi}
                                                        onChange={handleChange}
                                                        placeholder="BMI"
                                                    />
                                                </FormControl>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>

                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Medical History</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={4}>
                                                <FormControl>
                                                    <FormLabel>Allergies</FormLabel>
                                                    <Input
                                                        name="allergies"
                                                        value={formData.allergies}
                                                        onChange={handleChange}
                                                        placeholder="Known allergies"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Past Medical History</FormLabel>
                                                    <Textarea
                                                        name="pastMedicalHistory"
                                                        value={formData.pastMedicalHistory}
                                                        onChange={handleChange}
                                                        placeholder="Previous medical conditions"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Past Surgical History</FormLabel>
                                                    <Textarea
                                                        name="pastSurgicalHistory"
                                                        value={formData.pastSurgicalHistory}
                                                        onChange={handleChange}
                                                        placeholder="Previous surgeries"
                                                        rows={2}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Family History</FormLabel>
                                                    <Textarea
                                                        name="familyHistory"
                                                        value={formData.familyHistory}
                                                        onChange={handleChange}
                                                        placeholder="Family medical history"
                                                        rows={2}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Social History</FormLabel>
                                                    <Textarea
                                                        name="socialHistory"
                                                        value={formData.socialHistory}
                                                        onChange={handleChange}
                                                        placeholder="Smoking, alcohol, occupation"
                                                        rows={2}
                                                    />
                                                </FormControl>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 2: Symptoms */}
                                <TabPanel>
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Presenting Symptoms</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <FormControl>
                                                    <FormLabel>Chest Pain / Angina</FormLabel>
                                                    <Input
                                                        name="chestPain"
                                                        value={formData.chestPain}
                                                        onChange={handleChange}
                                                        placeholder="Describe chest pain"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Dyspnea</FormLabel>
                                                    <Input
                                                        name="dyspnea"
                                                        value={formData.dyspnea}
                                                        onChange={handleChange}
                                                        placeholder="Shortness of breath"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Orthopnea (# pillows)</FormLabel>
                                                    <Input
                                                        name="orthopnea"
                                                        value={formData.orthopnea}
                                                        onChange={handleChange}
                                                        placeholder="Number of pillows needed"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Paroxysmal Nocturnal Dyspnea</FormLabel>
                                                    <Input
                                                        name="pnd"
                                                        value={formData.pnd}
                                                        onChange={handleChange}
                                                        placeholder="PND description"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Palpitations</FormLabel>
                                                    <Input
                                                        name="palpitations"
                                                        value={formData.palpitations}
                                                        onChange={handleChange}
                                                        placeholder="Heart palpitations"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Syncope / Near-syncope</FormLabel>
                                                    <Input
                                                        name="syncope"
                                                        value={formData.syncope}
                                                        onChange={handleChange}
                                                        placeholder="Fainting episodes"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Edema (grading 1+ to 4+)</FormLabel>
                                                    <Input
                                                        name="edema"
                                                        value={formData.edema}
                                                        onChange={handleChange}
                                                        placeholder="Swelling grading"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Fatigue / Exercise Intolerance</FormLabel>
                                                    <Input
                                                        name="fatigue"
                                                        value={formData.fatigue}
                                                        onChange={handleChange}
                                                        placeholder="Fatigue description"
                                                    />
                                                </FormControl>
                                            </SimpleGrid>
                                            <FormControl mt={6}>
                                                <FormLabel>Other Symptoms</FormLabel>
                                                <Textarea
                                                    name="otherSymptoms"
                                                    value={formData.otherSymptoms}
                                                    onChange={handleChange}
                                                    placeholder="Additional symptoms"
                                                    rows={3}
                                                />
                                            </FormControl>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 3: Preliminary Diagnosis */}
                                <TabPanel>
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Initial Assessment</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel>Suspected Condition</FormLabel>
                                                    <Input
                                                        name="suspectedCondition"
                                                        value={formData.suspectedCondition}
                                                        onChange={handleChange}
                                                        placeholder="Initial diagnosis"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Risk Level</FormLabel>
                                                    <Select
                                                        name="riskLevel"
                                                        value={formData.riskLevel}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select Risk Level</option>
                                                        {riskLevelOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 4: Investigations */}
                                <TabPanel>
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Investigations Ordered</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6} align="stretch">
                                                <Box>
                                                    <FormLabel mb={4}>Laboratory Tests</FormLabel>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                                        {labTestOptions.map((test) => (
                                                            <Checkbox
                                                                key={test}
                                                                name="labTests"
                                                                value={test}
                                                                isChecked={formData.labTests.includes(test)}
                                                                onChange={handleChange}
                                                            >
                                                                {test}
                                                            </Checkbox>
                                                        ))}
                                                    </SimpleGrid>
                                                </Box>
                                                <Divider />
                                                <Box>
                                                    <FormLabel mb={4}>Imaging & Diagnostic Tests</FormLabel>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                                                        {imagingTestOptions.map((test) => (
                                                            <Checkbox
                                                                key={test}
                                                                name="imagingTests"
                                                                value={test}
                                                                isChecked={formData.imagingTests.includes(test)}
                                                                onChange={handleChange}
                                                            >
                                                                {test}
                                                            </Checkbox>
                                                        ))}
                                                    </SimpleGrid>
                                                </Box>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 5: Investigation Analysis */}
                                <TabPanel>
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Investigation Results</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel>ECG Findings</FormLabel>
                                                    <Textarea
                                                        name="ecgFindings"
                                                        value={formData.ecgFindings}
                                                        onChange={handleChange}
                                                        placeholder="Electrocardiogram findings"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Echocardiography Findings</FormLabel>
                                                    <Textarea
                                                        name="echoFindings"
                                                        value={formData.echoFindings}
                                                        onChange={handleChange}
                                                        placeholder="Echo results"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Laboratory Results</FormLabel>
                                                    <Textarea
                                                        name="labResults"
                                                        value={formData.labResults}
                                                        onChange={handleChange}
                                                        placeholder="Lab test results"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Imaging Results</FormLabel>
                                                    <Textarea
                                                        name="imagingResults"
                                                        value={formData.imagingResults}
                                                        onChange={handleChange}
                                                        placeholder="Other imaging results"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Other Findings</FormLabel>
                                                    <Textarea
                                                        name="otherFindings"
                                                        value={formData.otherFindings}
                                                        onChange={handleChange}
                                                        placeholder="Additional findings"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 6: Final Diagnosis */}
                                <TabPanel>
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Final Diagnosis</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <FormControl>
                                                    <FormLabel>Primary Diagnosis</FormLabel>
                                                    <Input
                                                        name="primaryDiagnosis"
                                                        value={formData.primaryDiagnosis}
                                                        onChange={handleChange}
                                                        placeholder="Main diagnosis"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>ICD-10 Code</FormLabel>
                                                    <Input
                                                        name="icdCode"
                                                        value={formData.icdCode}
                                                        onChange={handleChange}
                                                        placeholder="ICD code"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Severity / Stage</FormLabel>
                                                    <Select
                                                        name="severity"
                                                        value={formData.severity}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select Severity</option>
                                                        {severityOptions.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </SimpleGrid>
                                            <FormControl mt={6}>
                                                <FormLabel>Comorbidities</FormLabel>
                                                <Textarea
                                                    name="comorbidities"
                                                    value={formData.comorbidities}
                                                    onChange={handleChange}
                                                    placeholder="Other medical conditions"
                                                    rows={3}
                                                />
                                            </FormControl>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 7: Management */}
                                <TabPanel>
                                    <Card variant="outline" mb={6}>
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Medications</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={4} align="stretch">
                                                {formData.medications.map((med, index) => (
                                                    <Card key={index} variant="filled" size="sm">
                                                        <CardBody>
                                                            <HStack justify="space-between" mb={3}>
                                                                <Text fontWeight="bold">Medication #{index + 1}</Text>
                                                                <IconButton
                                                                    aria-label="Remove medication"
                                                                    icon={<DeleteIcon />}
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => removeArrayItem(index, "medications")}
                                                                />
                                                            </HStack>
                                                            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={3}>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Drug Name</FormLabel>
                                                                    <Input
                                                                        value={med.name}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "name", e.target.value, "medications")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Dose</FormLabel>
                                                                    <Input
                                                                        value={med.dose}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "dose", e.target.value, "medications")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Route</FormLabel>
                                                                    <Input
                                                                        value={med.route}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "route", e.target.value, "medications")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Frequency</FormLabel>
                                                                    <Input
                                                                        value={med.frequency}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "frequency", e.target.value, "medications")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Duration</FormLabel>
                                                                    <Input
                                                                        value={med.duration}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "duration", e.target.value, "medications")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                            </SimpleGrid>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                                <Button
                                                    leftIcon={<AddIcon />}
                                                    onClick={() =>
                                                        addArrayItem("medications", {
                                                            name: "",
                                                            dose: "",
                                                            route: "",
                                                            frequency: "",
                                                            duration: "",
                                                        })
                                                    }
                                                    variant="outline"
                                                    colorScheme="medical"
                                                >
                                                    Add Medication
                                                </Button>
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    <Card variant="outline" mb={6}>
                                        <CardHeader bg="medical.50" borderBottomWidth="1px">
                                            <Heading size="md">Procedures</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={4} align="stretch">
                                                {formData.procedures.map((proc, index) => (
                                                    <Card key={index} variant="filled" size="sm">
                                                        <CardBody>
                                                            <HStack justify="space-between" mb={3}>
                                                                <Text fontWeight="bold">Procedure #{index + 1}</Text>
                                                                <IconButton
                                                                    aria-label="Remove procedure"
                                                                    icon={<DeleteIcon />}
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => removeArrayItem(index, "procedures")}
                                                                />
                                                            </HStack>
                                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Procedure Name</FormLabel>
                                                                    <Input
                                                                        value={proc.name}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "name", e.target.value, "procedures")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Indication</FormLabel>
                                                                    <Input
                                                                        value={proc.indication}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "indication", e.target.value, "procedures")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Notes</FormLabel>
                                                                    <Input
                                                                        value={proc.notes}
                                                                        onChange={(e) =>
                                                                            handleArrayChange(index, "notes", e.target.value, "procedures")
                                                                        }
                                                                        size="sm"
                                                                    />
                                                                </FormControl>
                                                            </SimpleGrid>
                                                        </CardBody>
                                                    </Card>
                                                ))}
                                                <Button
                                                    leftIcon={<AddIcon />}
                                                    onClick={() =>
                                                        addArrayItem("procedures", {
                                                            name: "",
                                                            indication: "",
                                                            notes: "",
                                                        })
                                                    }
                                                    variant="outline"
                                                    colorScheme="medical"
                                                >
                                                    Add Procedure
                                                </Button>
                                            </VStack>
                                        </CardBody>
                                    </Card>

                                    <Card variant="outline">
                                        <CardBody>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel>Lifestyle & Preventive Advice</FormLabel>
                                                    <Textarea
                                                        name="lifestyleAdvice"
                                                        value={formData.lifestyleAdvice}
                                                        onChange={handleChange}
                                                        placeholder="Diet, exercise, smoking cessation advice"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Follow-Up Plan</FormLabel>
                                                    <Input
                                                        name="followUp"
                                                        value={formData.followUp}
                                                        onChange={handleChange}
                                                        placeholder="Follow-up schedule"
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Warning Signs / Red Flags</FormLabel>
                                                    <Textarea
                                                        name="warningSigns"
                                                        value={formData.warningSigns}
                                                        onChange={handleChange}
                                                        placeholder="Symptoms requiring immediate attention"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 8: Physician Notes */}
                                <TabPanel>
                                    <Card variant="outline">
                                        <CardBody>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel>Physician Notes</FormLabel>
                                                    <Textarea
                                                        name="physicianNotes"
                                                        value={formData.physicianNotes}
                                                        onChange={handleChange}
                                                        placeholder="Clinical assessment and reasoning"
                                                        rows={5}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Patient Questions / Concerns</FormLabel>
                                                    <Textarea
                                                        name="patientQuestions"
                                                        value={formData.patientQuestions}
                                                        onChange={handleChange}
                                                        placeholder="Patient's questions and concerns"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>Action Items</FormLabel>
                                                    <Textarea
                                                        name="actionItems"
                                                        value={formData.actionItems}
                                                        onChange={handleChange}
                                                        placeholder="Tasks and next steps"
                                                        rows={3}
                                                    />
                                                </FormControl>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>

                {/* Navigation Buttons */}
                <HStack justify="space-between">
                    <Button
                        onClick={handlePrevTab}
                        isDisabled={activeTab === 0}
                        variant="outline"
                        colorScheme="medical"
                    >
                        Previous
                    </Button>
                    {activeTab < 7 ? (
                        <Button onClick={handleNextTab} colorScheme="medical">
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            colorScheme="blue"
                            isLoading={isSubmitting}
                            loadingText="Submitting"
                        >
                            Submit
                        </Button>
                    )}
                </HStack>
            </VStack>
            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
};

export default CardiologyForm;