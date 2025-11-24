import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    getAllEnrollments,
    getMyEnrollments,
    getEnrollmentById,
    enrollStudent,
    dropEnrollment,
    validateEnrollment,
    getStudentSchedule,
    getEnrollmentsBySection,
} from "./enrollments.controller";
import {
    enrollStudentSchema,
    dropEnrollmentSchema,
    getEnrollmentSchema,
} from "./enrollments.validator";

const router = Router();

router.get("/", authMiddleware, getAllEnrollments);
router.get("/my-enrollments", authMiddleware, getMyEnrollments);
router.get(
    "/:id",
    authMiddleware,
    validateRequest(getEnrollmentSchema),
    getEnrollmentById
);
router.post(
    "/enroll",
    authMiddleware,
    validateRequest(enrollStudentSchema),
    enrollStudent
);
router.post("/validate", authMiddleware, validateEnrollment);
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(dropEnrollmentSchema),
    dropEnrollment
);
router.get("/schedule/:studentId/:termId", authMiddleware, getStudentSchedule);
router.get("/section/:sectionId", authMiddleware, getEnrollmentsBySection);

export default router;
