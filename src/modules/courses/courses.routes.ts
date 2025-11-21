import { Router } from "express";
import { coursesController } from "./courses.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    createCourseSchema,
    updateCourseSchema,
    courseIdSchema,
    courseQuerySchema,
    addPrerequisiteSchema,
    removePrerequisiteSchema,
} from "./courses.validator";
import { roleMiddleware } from "../../middlewares/permission.middleware";

const router = Router();

/**
 * @route   GET /api/courses
 * @desc    Get all courses
 * @access  Public
 */
router.get(
    "/",
    validateRequest(courseQuerySchema),
    coursesController.getAll.bind(coursesController)
);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public
 */
router.get(
    "/:id",
    validateRequest(courseIdSchema),
    coursesController.getById.bind(coursesController)
);

/**
 * @route   GET /api/courses/:id/prerequisites
 * @desc    Get course prerequisites
 * @access  Public
 */
router.get(
    "/:id/prerequisites",
    validateRequest(courseIdSchema),
    coursesController.getPrerequisites.bind(coursesController)
);

/**
 * @route   GET /api/courses/:id/prerequisite-tree
 * @desc    Get prerequisite tree (recursive)
 * @access  Public
 */
router.get(
    "/:id/prerequisite-tree",
    validateRequest(courseIdSchema),
    coursesController.getPrerequisiteTree.bind(coursesController)
);

/**
 * @route   POST /api/courses
 * @desc    Create new course
 * @access  Private (Admin, Super Admin only)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(createCourseSchema),
    coursesController.create.bind(coursesController)
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Admin, Super Admin only)
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(updateCourseSchema),
    coursesController.update.bind(coursesController)
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (Super Admin only)
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN"),
    validateRequest(courseIdSchema),
    coursesController.delete.bind(coursesController)
);

/**
 * @route   POST /api/courses/:id/prerequisites
 * @desc    Add prerequisite to course
 * @access  Private (Admin, Super Admin only)
 */
router.post(
    "/:id/prerequisites",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(addPrerequisiteSchema),
    coursesController.addPrerequisite.bind(coursesController)
);

/**
 * @route   DELETE /api/courses/:id/prerequisites/:prerequisiteId
 * @desc    Remove prerequisite from course
 * @access  Private (Admin, Super Admin only)
 */
router.delete(
    "/:id/prerequisites/:prerequisiteId",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(removePrerequisiteSchema),
    coursesController.removePrerequisite.bind(coursesController)
);

export default router;
