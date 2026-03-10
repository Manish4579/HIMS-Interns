import express from "express";
import {
  postRequest,
  getNextRequestNumber,
} from "../controllers/request.controllers.js";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get auto request number
router.get("/getNextRequestNumber", verifyToken,getNextRequestNumber);

// Post request (with existing upload middleware)
router.post("/postRequest",verifyToken, upload, postRequest);

export default router;