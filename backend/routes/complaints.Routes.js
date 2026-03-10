import express from "express";
import upload from "../middleware/upload.js";
import {
  getComplaintMaster,
  postComplaintMaster,
  updateComplaintMaster,
  deleteComplaintMaster,
  getComplaintList,
  updateComplaintStatus,
  getComplaintAttachments,
  postComplaintAttachment,
  deleteComplaintAttachment
} from "../controllers/complaint.Controller.js";

import {getComplaintAssignments,
    assignComplaint,
    updateComplaintAssignment,
    deleteComplaintAssignment
} from "../controllers/complaint.Controller.js"
import { verifyToken } from "../middleware/authMiddleware.js";
import { verify } from "crypto";
const complaintRouter = express.Router();

// Complaint master routes
complaintRouter.get("/getComplaintMaster",verifyToken, getComplaintMaster);

complaintRouter.post(
  "/postComplaintMaster",
  verifyToken,
  upload,
  postComplaintMaster
);

complaintRouter.put("/updateComplaintMaster/:complaint_id",verifyToken, updateComplaintMaster);

complaintRouter.delete("/deleteComplaintMaster/:complaint_id",verifyToken, deleteComplaintMaster);

// Complaint list routes
complaintRouter.get("/getComplaintList",verifyToken, getComplaintList);
complaintRouter.patch("/updateStatus/:complaint_id",verifyToken, updateComplaintStatus);

// Attachment routes
complaintRouter.get("/getComplaintAttachments",verifyToken, getComplaintAttachments);

complaintRouter.post(
  "/postComplaintAttachment",
  verifyToken,
  upload,
  postComplaintAttachment
);

complaintRouter.delete(
  "/deleteComplaintAttachment/:attachment_id",
  verifyToken,
  deleteComplaintAttachment
);



complaintRouter.get("/get-complaint-assigned/:complaint_id",verifyToken,getComplaintAssignments)
complaintRouter.post("/post-complaint-assigned",verifyToken,assignComplaint)
complaintRouter.put("/update-complaint-assigned/:assignment_id",verifyToken,updateComplaintAssignment)
complaintRouter.delete("/delete-complaint-assigned/:assignment_id",verifyToken,deleteComplaintAssignment)
export default complaintRouter;