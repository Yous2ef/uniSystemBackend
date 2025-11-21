import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { config } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import collegesRoutes from "./modules/colleges/colleges.routes";
import departmentsRoutes from "./modules/departments/departments.routes";
import coursesRoutes from "./modules/courses/courses.routes";
import curriculumRoutes from "./modules/curriculum/curriculum.routes";
import studentsRoutes from "./modules/students/students.routes";
import batchesRoutes from "./modules/batches/batches.routes";
import termsRoutes from "./modules/terms/terms.routes";
import sectionsRoutes from "./modules/sections/sections.routes";
import enrollmentsRoutes from "./modules/enrollments/enrollments.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import gradesRoutes from "./modules/grades/grades.routes";
import facultyRoutes from "./modules/faculty/faculty.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import departmentSelectionRoutes from "./modules/department-selection/department-selection.routes";
import backupRoutes from "./modules/backup/backup.routes";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
    cors({
        origin: config.cors.origin,
        credentials: true,
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegesRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/batches", batchesRoutes);
app.use("/api/terms", termsRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/department-selection", departmentSelectionRoutes);
app.use("/api/backup", backupRoutes);

// 404 handler
app.use("*", (_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`🌐 CORS Origin: ${config.cors.origin}`);
});

export default app;
