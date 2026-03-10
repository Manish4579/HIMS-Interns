import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";

// Home
import Home from "./pages/home";

// Feedback
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";

// Complaints
import Complaints from "./pages/complaints";
import ComplaintList from "./pages/complaint_list";

// Employees
import Employee from "./pages/employee";
import EmployeeRequest from "./pages/EmployeeRequest";

import PatientRecords from "./pages/patientsRecords";
import RegisterPatient from "./pages/registerPatient";
import EmployeeRecords from "./pages/employee"

import CardiologyForm from "./pages/CardiologyForm"; 
import CardiologyList from "./pages/CardiologyList";

function App() {
  return (
    <Flex>
      <Sidebar />

      <Box flex="1" p={5} ml="260px">
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Feedback */}
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/feedback-list" element={<FeedbackList />} />

          {/* Complaints */}
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaint_list" element={<ComplaintList />} />

          {/* Employees */}
          <Route path="/employee-records" element={<Employee />} />
          <Route path="/employee-request" element={<EmployeeRequest />} />

          {/* Patients */}
          <Route path="/patient-records" element={<PatientRecords />} />
          {/* Other Pages */}
          <Route path="/registerPatient" element={<RegisterPatient />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/request" element={<EmployeeRequest />} />
          <Route path="/employee-records" element={<EmployeeRecords />} />
          <Route path="/patient-register" element={< RegisterPatient  />} />

          <Route path="/cardiology-form" element={<CardiologyForm />} /> 
          <Route path="/cardiology-list" element={<CardiologyList />} />



        </Routes>
      </Box>
    </Flex>
  );
}

export default App;