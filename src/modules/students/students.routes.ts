import { Router } from "express";
import studentsController from "./students.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    createStudentSchema,
    updateStudentSchema,
    getStudentSchema,
    deleteStudentSchema,
    getStudentsByBatchSchema,
    assignDepartmentSchema,
    importStudentsSchema,
} from "./students.validator";

const router = Router();

/**
 * @route   GET /api/students/profile
 * @desc    Get current student profile
 * @access  Student
 */
router.get("/profile", authMiddleware, studentsController.getProfile);

/**
 * @route   GET /api/students/user/:userId
 * @desc    Get student by user ID
 * @access  Admin, Faculty, Self
 */
router.get("/user/:userId", studentsController.getStudentByUserId);

/**
 * @route   GET /api/students
 * @desc    Get all students with filters and pagination
 * @access  Admin, Faculty
 */
router.get("/", studentsController.getAllStudents);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Admin, Faculty, Self
 */
router.get(
    "/:id",
    validateRequest(getStudentSchema),
    studentsController.getStudentById
);

/**
 * @route   POST /api/students
 * @desc    Create new student
 * @access  Admin
 */
router.post(
    "/",
    validateRequest(createStudentSchema),
    studentsController.createStudent
);

/**
 * @route   PUT /api/students/:id
 * @desc    Update student
 * @access  Admin
 */
router.put(
    "/:id",
    validateRequest(updateStudentSchema),
    studentsController.updateStudent
);

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student (soft delete)
 * @access  Admin
 */
router.delete(
    "/:id",
    validateRequest(deleteStudentSchema),
    studentsController.deleteStudent
);

/**
 * @route   PUT /api/students/:id/department
 * @desc    Assign department to student
 * @access  Admin
 */
router.put(
    "/:id/department",
    validateRequest(assignDepartmentSchema),
    studentsController.assignDepartment
);

/**
 * @route   GET /api/students/batch/:batchId
 * @desc    Get students by batch
 * @access  Admin, Faculty
 */
router.get(
    "/batch/:batchId",
    validateRequest(getStudentsByBatchSchema),
    studentsController.getStudentsByBatch
);

/**
 * @route   POST /api/students/import
 * @desc    Import students from CSV
 * @access  Admin
 */
router.post(
    "/import",
    validateRequest(importStudentsSchema),
    studentsController.importStudents
);

export default router;
