import express from "express";
import {
  registerPatient,
  getPatients,
  updatePatient,
  deletePatient
} from "../controllers/registerPatient.controllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const registerPatientRouter = express.Router();

registerPatientRouter.post("/registerPatient", verifyToken,registerPatient);
registerPatientRouter.get("/getPatients",verifyToken, getPatients);
registerPatientRouter.put("/updatePatient/:patient_id",verifyToken, updatePatient);
registerPatientRouter.delete("/deletePatient/:patient_id", verifyToken,deletePatient);

export default registerPatientRouter;