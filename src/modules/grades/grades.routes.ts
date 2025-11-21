import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    createGradeComponent,
    updateGradeComponent,
    deleteGradeComponent,
    getSectionComponents,
    recordGrade,
    updateGrade,
    getStudentGrades,
    getMyGrades,
    publishFinalGrades,
    calculateGPA,
    getTranscript,
} from "./grades.controller";
import {
    createGradeComponentSchema,
    updateGradeComponentSchema,
    recordGradeSchema,
    updateGradeSchema,
    publishFinalGradesSchema,
} from "./grades.validator";

const router = Router();

// Grade Components
router.post(
    "/components",
    authMiddleware,
    validateRequest(createGradeComponentSchema),
    createGradeComponent
);
router.put(
    "/components/:id",
    authMiddleware,
    validateRequest(updateGradeComponentSchema),
    updateGradeComponent
);
router.delete("/components/:id", authMiddleware, deleteGradeComponent);
router.get(
    "/components/section/:sectionId",
    authMiddleware,
    getSectionComponents
);

// Grades
router.post(
    "/record",
    authMiddleware,
    validateRequest(recordGradeSchema),
    recordGrade
);
router.put(
    "/:id",
    authMiddleware,
    validateRequest(updateGradeSchema),
    updateGrade
);
router.get("/my-grades", authMiddleware, getMyGrades);
router.get("/student/:enrollmentId", authMiddleware, getStudentGrades);

// Final Grades & GPA
router.post(
    "/publish",
    authMiddleware,
    validateRequest(publishFinalGradesSchema),
    publishFinalGrades
);
router.get("/gpa/:studentId/:termId", authMiddleware, calculateGPA);
router.get("/transcript/:studentId", authMiddleware, getTranscript);

export default router;
