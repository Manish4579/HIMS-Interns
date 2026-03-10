






import { useState, useEffect } from "react";
import {
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Grid, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  FormErrorMessage, 
  Flex, 
  Checkbox, 
  Textarea, 
  RadioGroup, 
  Radio, 
  Divider, 
  Button, 
  IconButton, 
  Progress, 
  Badge,
  useToast
} from "@chakra-ui/react";
import { StarIcon,EditIcon, DeleteIcon,PlusSquareIcon } from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";


const ALL_MODULES = ["Registration", "Doctor Consultation", "Billing"];

function FeedbackForm() {

  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [includeModules, setIncludeModules] = useState(false);
  const [savedModules, setSavedModules] = useState([]);
  const [availableModules, setAvailableModules] = useState(ALL_MODULES);
  const [selectedModule, setSelectedModule] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const [currentModuleData, setCurrentModuleData] = useState({
    rating: 0,
    comment: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.editData;
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    admission_id: "",
    service_type: "",
    rating: 0,
    consent_flag: false,
    feedback_comments: "",
  });

  const [errors, setErrors] = useState({});
  
  /* ================= LOAD EDIT DATA ================= */

  useEffect(() => {
    if (!editData) return;

    setFormData({
      patient_id: editData.patient_id||"",
      patient_name: editData.patient_name||"",
      admission_id: editData.admission_id||"",
      service_type: editData.service_type||"",
      rating: editData.overall_rating||0,
      consent_flag: !!editData.consent_flag,
      feedback_comments: editData.feedback_comments||"",
    },[editData]);

    setSavedModules(editData.module_ratings || []);

    const used = (editData.module_ratings || []).map(
      (m) => m.module_name
    );

    setAvailableModules(ALL_MODULES.filter((m) => !used.includes(m)));

    setIncludeModules(
      editData.module_ratings && editData.module_ratings.length > 0
    );
  }, [editData]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNumberChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.patient_id) newErrors.patient_id = "Required";
    if (!formData.patient_name) newErrors.patient_name = "Required";
    if (!formData.admission_id) newErrors.admission_id = "Required";
    if (!formData.service_type) newErrors.service_type = "Required";
    if (!formData.rating) newErrors.rating = "Required";
    if (!formData.consent_flag)
      newErrors.consent_flag = "Consent required";

    if (includeModules && savedModules.length === 0)
      newErrors.modules = "Add at least one module";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveModule = () => {
    if (!selectedModule || !currentModuleData.rating) {
      toast({ title: "Provide module rating", status: "error" });
      return;
    }

    let updated;

    if (editingIndex !== null) {
      updated = [...savedModules];
      updated[editingIndex] = {
        module_name: selectedModule,
        ...currentModuleData,
      };
      setEditingIndex(null);
    } else {
      updated = [
        ...savedModules,
        { module_name: selectedModule, ...currentModuleData },
      ];
      setAvailableModules(
        availableModules.filter((m) => m !== selectedModule)
      );
    }

    setSavedModules(updated);
    if (updated.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.modules;
        return newErrors;
      });
    }
    setSelectedModule("");
    setCurrentModuleData({ rating: 0, comment: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const url = editData
      ? `http://localhost:3000/feedback/updateFeedback/${editData.feedback_id}`
      : "http://localhost:3000/feedback/postFeedback";

    const method = editData ? "PUT" : "POST";

    try {
       const token=localStorage.getItem("token")
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" ,
          "Authorization": `Bearer ${token}`
  },
        body: JSON.stringify({
          ...formData,
          feedback_mode: "Online",
          module_ratings: includeModules ? savedModules : [],
        }),
      });
if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      toast({
        title: editData ? "Updated" : "Submitted",
        status: "success",
      });
      navigate("/feedback-list")
      setFormData({
        patient_id: "",
        patient_name: "",
        admission_id: "",
        service_type: "",
        rating: 0,
        consent_flag: false,
        feedback_comments: "",
      });
      setSavedModules([]);
      setIncludeModules(false);
    } catch (err) {
      toast({ title: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  const handleSelectModule = (e) => {
    setSelectedModule(e.target.value);
    setCurrentModuleData({ rating: 0, comment: "" });
    setEditingIndex(null);
  };

  const handleEditModule = (index) => {
    const module = savedModules[index];
    setSelectedModule(module.module_name);
    setCurrentModuleData({ rating: module.rating, comment: module.comment });
    setEditingIndex(index);
  };

  const handleDeleteModule = (index) => {
    const deleted = savedModules[index];
    setSavedModules(savedModules.filter((_, i) => i !== index));
    setAvailableModules([...availableModules, deleted.module_name]);
  };

  return (
    <>
    <Box 
  bg="white" 
  p={10} 
  borderRadius="2xl" 
  boxShadow="0 10px 30px rgba(0,0,0,0.08)" 
  border="1px" 
  borderColor="gray.50"
>
  {/* Header Section */}
  <VStack align="start" spacing={1} mb={8}>
    <Heading size="lg" color="blue.700" fontWeight="800" letterSpacing="tight">
      {editData ? "Update Patient Record" : "Patient Experience Feedback"}
    </Heading>
    <Box h="4px" w="60px" bg="teal.400" borderRadius="full" />
    <Text color="gray.500" fontSize="sm" mt={2}>
      Your feedback helps us provide world-class healthcare services.
    </Text>
  </VStack>

  <form onSubmit={handleSubmit}>
    <Grid templateColumns="repeat(2, 1fr)" gap={8}>
      {/* Patient ID */}
      <FormControl isRequired isInvalid={errors.patient_id}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Patient Identifier
        </FormLabel>
        <Input
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="patient_id"
          value={formData.patient_id}
          onChange={handleNumberChange}
          placeholder="e.g. 100234"
        />
        <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
      </FormControl>

      {/* Patient Name */}
      <FormControl isRequired isInvalid={errors.patient_name}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Full Name
        </FormLabel>
        <Input
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="patient_name"
          value={formData.patient_name}
          onChange={handleChange}
          placeholder="John Doe"
        />
        <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
      </FormControl>

      {/* Admission ID */}
      <FormControl isRequired isInvalid={errors.admission_id}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Admission ID
        </FormLabel>
        <Input
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="admission_id"
          value={formData.admission_id}
          onChange={handleNumberChange}
        />
        <FormErrorMessage>{errors.admission_id}</FormErrorMessage>
      </FormControl>

      {/* Service Type */}
      <FormControl isRequired isInvalid={errors.service_type}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Department/Service
        </FormLabel>
        <Select
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          placeholder="Select Service"
        >
          <option value="OPD">Outpatient (OPD)</option>
          <option value="IPD">Inpatient (IPD)</option>
          <option value="Diagnostic">Diagnostic Services</option>
          <option value="Pharmacy">Pharmacy</option>
        </Select>
        <FormErrorMessage>{errors.service_type}</FormErrorMessage>
      </FormControl>

      {/* Rating & Consent */}
      <FormControl isRequired isInvalid={errors.rating}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Overall Satisfaction
        </FormLabel>
        <Flex gap={2} p={2} bg="gray.50" borderRadius="md" w="fit-content">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              boxSize={6}
              cursor="pointer"
              color={star <= formData.rating ? "orange.400" : "gray.300"}
              onClick={() => setFormData({ ...formData, rating: star })}
              transition="0.2s"
              _hover={{ transform: "scale(1.2)" }}
            />
          ))}
        </Flex>
      </FormControl>

      <FormControl isRequired isInvalid={errors.consent_flag} alignSelf="end">
        <Checkbox
          colorScheme="teal"
          size="lg"
          isChecked={formData.consent_flag}
          onChange={(e) => setFormData({ ...formData, consent_flag: e.target.checked })}
        >
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Authorized to record this feedback
          </Text>
        </Checkbox>
      </FormControl>

      <FormControl gridColumn="span 2">
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Additional Obṣservations
        </FormLabel>
        <Textarea
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="feedback_comments"
          value={formData.feedback_comments??""}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
    </Grid>
    {/* Toggle Section */}
    <Box mt={10} p={5} borderRadius="xl" bg="teal.50" border="1px dashed" borderColor="teal.200">
      <Flex justify="space-between" align="center">
        <HStack>
          <Box p={2} bg="teal.500" borderRadius="lg" color="white">
            <PlusSquareIcon />
          </Box>
          <Text fontWeight="bold" color="teal.800">Module-wise detailed analysis?</Text>
        </HStack>
        <RadioGroup onChange={(val) => setIncludeModules(val === "true")} value={includeModules.toString()}>
          <HStack spacing={6}>
            <Radio value="true" colorScheme="teal">Yes</Radio>
            <Radio value="false" colorScheme="teal">No</Radio>
          </HStack>
        </RadioGroup>
      </Flex>
    </Box>

    {includeModules && (
      <VStack spacing={6} mt={6} p={6} bg="gray.50" borderRadius="xl">
        <FormControl isInvalid={!!errors.modules}>
          <FormLabel fontSize="sm" fontWeight="bold">Specific Department/Module</FormLabel>
          <Select bg="white" value={selectedModule} onChange={handleSelectModule} placeholder="Select module">
            {availableModules.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </Select>
        </FormControl>

        {selectedModule && (
          <Box w="full" p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
             <Grid templateColumns="1fr 2fr" gap={6} alignItems="end">
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={2}>Rating</Text>
                  <HStack>
                    {[1,2,3,4,5].map(s => (
                      <StarIcon key={s} cursor="pointer" color={s <= currentModuleData.rating ? "orange.400" : "gray.200"} 
                      onClick={() => setCurrentModuleData({...currentModuleData, rating: s})} />
                    ))}
                  </HStack>
                </Box>
                <Input variant="flushed" placeholder="Specific notes..." value={currentModuleData.comment}
                  onChange={(e) => setCurrentModuleData({...currentModuleData, comment: e.target.value})} />
             </Grid>
             <Button mt={4} colorScheme="teal" size="sm" variant="ghost" onClick={handleSaveModule}>
                + Confirm Module Rating
             </Button>
          </Box>
        )}

        {/* Saved Items List */}
        <VStack w="full" spacing={3}>
          {savedModules.map((m, i) => (
            <Flex key={i} w="full" p={4} bg="white" borderRadius="lg" align="center" justify="space-between" border="1px solid" borderColor="gray.100">
               <HStack spacing={4}>
                  <Badge colorScheme="teal" variant="subtle" px={2}>{m.module_name}</Badge>
                  <Text fontSize="sm" fontWeight="bold">⭐ {m.rating}</Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>{m.comment}</Text>
               </HStack>
               <HStack>
                 <IconButton size="xs" icon={<EditIcon />} aria-label="Edit" onClick={() => handleEditModule(i)} />
                 <IconButton size="xs" colorScheme="red" variant="ghost" icon={<DeleteIcon />} aria-label="Delete" onClick={() => handleDeleteModule(i)} />
               </HStack>
            </Flex>
          ))}
        </VStack>

        <Box w="full">
            <Progress value={(savedModules.length / ALL_MODULES.length) * 100} size="xs" borderRadius="full" colorScheme="teal" mb={1} />
            <Text fontSize="10px" textAlign="right" fontWeight="bold" color="gray.400">
                AUDIT PROGRESS: {savedModules.length}/{ALL_MODULES.length}
            </Text>
        </Box>
      </VStack>
    )}

    {/* Footer Actions */}
    <HStack spacing={4} mt={12}>
      <Button
        h="55px"
        px={12}
        colorScheme="blue"
        bg="blue.700"
        _hover={{ bg: "blue.800" }}
        type="submit"
        isLoading={loading}
        borderRadius="xl"
      >
        {editData ? "Confirm Changes" : "Finalize Feedback"}
      </Button>
      {editData && (
        <Button variant="ghost" colorScheme="red" h="55px" px={8} onClick={() => navigate("/feedback-list")}>
          Discard Edits
        </Button>
      )}
    </HStack>
  </form>
</Box>
    </>
  )
}


export default FeedbackForm;
