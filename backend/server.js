import express from "express";
import "dotenv/config";
import cors from "cors";

// Routes
import feedbackRoutes from "./routes/feedback.Routes.js";
import complaintRoutes from "./routes/complaints.Routes.js";
import requestRoutes from "./routes/request.routes.js";
import employeeRoutes from "./routes/employee.Routes.js";
import patientRoutes from "./routes/registerPatient.Routes.js";      // renamed for clarity
import cardiologyRoutes from "./routes/Cardiology.Routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================

// CORS - allow frontend origin (Vite default: 5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Serve static files (uploads folder)
app.use("/uploads", express.static("uploads"));

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    port: PORT,
    time: new Date().toISOString(),
  });
});

// ================= API ROUTES =================

// Feedback
app.use("/api/feedback", feedbackRoutes);

// Complaints
app.use("/api/complaints", complaintRoutes);

// Requests
app.use("/api/requests", requestRoutes);

// Employees
app.use("/api/employees", employeeRoutes);

// Patients / Registration
app.use("/api/patients", patientRoutes);

// Cardiology Form
app.use("/api/cardiology", cardiologyRoutes);

// ================= GLOBAL ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});