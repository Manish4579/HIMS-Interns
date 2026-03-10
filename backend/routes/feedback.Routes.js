import express from "express"
import {  getfeedBack, postFeedback } from "../controllers/feedback.controllers.js"

import { updateFeedback } from "../controllers/feedback.controllers.js"
import { deleteFeedback } from "../controllers/feedback.controllers.js"
import { verifyToken } from "../middleware/authMiddleware.js";

const patient_feedback=express.Router()

patient_feedback.get("/getFeedback",verifyToken,getfeedBack)
patient_feedback.post("/postFeedback",verifyToken,postFeedback)
patient_feedback.put("/updateFeedback/:feedback_id",verifyToken,updateFeedback)
patient_feedback.delete("/deleteFeedback/:feedback_id",verifyToken,deleteFeedback)
export default patient_feedback;