import express from "express";
import { employeeLogin } from "../controllers/EmployeeLoginPage.controllers.js";

const employeeLoginRouter = express.Router();

/* Employee Login */
employeeLoginRouter.post("/login", employeeLogin);

export default employeeLoginRouter;