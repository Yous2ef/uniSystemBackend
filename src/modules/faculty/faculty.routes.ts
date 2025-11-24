import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    getAllFaculty,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getFacultySections,
} from "./faculty.controller";
import {
    createFacultySchema,
    updateFacultySchema,
    getFacultySchema,
    deleteFacultySchema,
    getFacultySectionsSchema,
} from "./faculty.validator";

const router = Router();

/**
 * @route   GET /api/faculty
 * @desc    Get all faculty members
 * @access  Private
 */
router.get("/", authMiddleware, getAllFaculty);

/**
 * @route   GET /api/faculty/:id
 * @desc    Get faculty by ID
 * @access  Private
 */
router.get(
    "/:id",
    authMiddleware,
    validateRequest(getFacultySchema),
    getFacultyById
);

/**
 * @route   POST /api/faculty
 * @desc    Create new faculty member
 * @access  Private (Admin)
 */
router.post(
    "/",
    authMiddleware,
    validateRequest(createFacultySchema),
    createFaculty
);

/**
 * @route   PUT /api/faculty/:id
 * @desc    Update faculty member
 * @access  Private (Admin)
 */
router.put(
    "/:id",
    authMiddleware,
    validateRequest(updateFacultySchema),
    updateFaculty
);

/**
 * @route   DELETE /api/faculty/:id
 * @desc    Delete faculty member
 * @access  Private (Admin)
 */
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(deleteFacultySchema),
    deleteFaculty
);

/**
 * @route   GET /api/faculty/:id/sections
 * @desc    Get faculty sections
 * @access  Private
 */
router.get(
    "/:id/sections",
    authMiddleware,
    validateRequest(getFacultySectionsSchema),
    getFacultySections
);

export default router;
