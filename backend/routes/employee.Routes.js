import express from "express";
import {
  registerEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
} from "../controllers/employee.controllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const registerEmployeeRouter = express.Router();

registerEmployeeRouter.post("/registerEmployee",verifyToken, registerEmployee);
registerEmployeeRouter.get("/getEmployees",verifyToken, getEmployees);
registerEmployeeRouter.put("/updateEmployee/:employee_id", verifyToken,updateEmployee);
registerEmployeeRouter.delete("/deleteEmployee/:employee_id",verifyToken, deleteEmployee);

export default registerEmployeeRouter;