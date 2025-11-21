import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    applyDepartmentSchema,
    processApplicationSchema,
} from "./department-selection.validator";
import {
    getAvailableDepartments,
    getStudentEligibility,
    getMyApplication,
    applyToDepartment,
    withdrawApplication,
    getAllApplications,
    processApplication,
    getStatistics,
} from "./department-selection.controller";

const router = Router();

// Student routes
router.get("/available", authMiddleware, getAvailableDepartments);
router.get("/my-eligibility", authMiddleware, getStudentEligibility);
router.get("/my-application", authMiddleware, getMyApplication);
router.post(
    "/apply",
    authMiddleware,
    validateRequest(applyDepartmentSchema),
    applyToDepartment
);
router.put("/withdraw/:applicationId", authMiddleware, withdrawApplication);

// Admin routes
router.get("/applications", authMiddleware, getAllApplications);
router.put(
    "/applications/:applicationId/process",
    authMiddleware,
    validateRequest(processApplicationSchema),
    processApplication
);
router.get("/statistics", authMiddleware, getStatistics);

export default router;
