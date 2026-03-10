// Cardiology.Routes.js
import express from "express";
import {
    upsertPatient,
    upsertVitalSigns,
    upsertMedicalHistory,
    upsertSymptoms,
    upsertPreliminaryDiagnosis,
    addOrderedInvestigation,
    upsertInvestigationResults,
    upsertFinalDiagnosis,
    addMedication,
    addProcedure,
    upsertManagementNotes,
    upsertPhysicianNotes,
    searchPatients,
    getCardiologyDetails
} from "../controllers/Cardiology.Controllers.js";

const cardiologyRouter = express.Router();

// ───────────────────────────────────────────────
// 1. Patient Core (demographics + height/weight/age/etc.)
// ───────────────────────────────────────────────
cardiologyRouter.post("/patients", upsertPatient);                      // Create new patient
cardiologyRouter.patch("/patients/:patient_id", upsertPatient);        // Update existing patient

// ───────────────────────────────────────────────
// 2. Vital Signs (BP, HR, RR, Temp, BMI)
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/vital-signs", upsertVitalSigns);

// ───────────────────────────────────────────────
// 3. Medical History (allergies + past/family/social)
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/medical-history", upsertMedicalHistory);

// ───────────────────────────────────────────────
// 4. Symptoms
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/symptoms", upsertSymptoms);

// ───────────────────────────────────────────────
// 5. Preliminary Diagnosis
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/preliminary-diagnosis", upsertPreliminaryDiagnosis);

// ───────────────────────────────────────────────
// 6. Ordered Investigations (called once per checked test)
// ───────────────────────────────────────────────
cardiologyRouter.post("/patients/:patient_id/ordered-investigations", addOrderedInvestigation);

// ───────────────────────────────────────────────
// 7. Investigation Results
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/investigation-results", upsertInvestigationResults);

// ───────────────────────────────────────────────
// 8. Final Diagnosis
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/final-diagnosis", upsertFinalDiagnosis);

// ───────────────────────────────────────────────
// 9. Medications (one POST per medication row)
// ───────────────────────────────────────────────
cardiologyRouter.post("/patients/:patient_id/medications", addMedication);

// ───────────────────────────────────────────────
// 10. Procedures (one POST per procedure row)
// ───────────────────────────────────────────────
cardiologyRouter.post("/patients/:patient_id/procedures", addProcedure);

// ───────────────────────────────────────────────
// 11. Management Notes (lifestyle + follow-up + warnings)
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/management-notes", upsertManagementNotes);

// ───────────────────────────────────────────────
// 12. Physician Notes
// ───────────────────────────────────────────────
cardiologyRouter.patch("/patients/:patient_id/physician-notes", upsertPhysicianNotes);

// ───────────────────────────────────────────────
// 13. Search Patients (for Cardiology List page)
// ───────────────────────────────────────────────
cardiologyRouter.get("/patients/search", searchPatients);

// ───────────────────────────────────────────────
// 14. Get Full Cardiology Details
// ───────────────────────────────────────────────
cardiologyRouter.get("/patients/:patient_id/cardiology", getCardiologyDetails);
export default cardiologyRouter;