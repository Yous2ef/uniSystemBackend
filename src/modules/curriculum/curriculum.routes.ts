import { Router } from "express";
import * as curriculumController from "./curriculum.controller";
import * as curriculumValidator from "./curriculum.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/permission.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";

const router = Router();

/**
 * @route   GET /api/curriculum
 * @desc    Get all curricula
 * @access  Public
 */
router.get(
    "/",
    validateRequest(curriculumValidator.queryCurriculaSchema),
    curriculumController.getAll
);

/**
 * @route   GET /api/curriculum/:id
 * @desc    Get curriculum by ID
 * @access  Public
 */
router.get(
    "/:id",
    validateRequest(curriculumValidator.getCurriculumByIdSchema),
    curriculumController.getById
);

/**
 * @route   GET /api/curriculum/:id/validate
 * @desc    Validate curriculum
 * @access  Public
 */
router.get(
    "/:id/validate",
    validateRequest(curriculumValidator.validateCurriculumSchema),
    curriculumController.validate
);

/**
 * @route   POST /api/curriculum
 * @desc    Create new curriculum
 * @access  Private (Admin only)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(curriculumValidator.createCurriculumSchema),
    curriculumController.create
);

/**
 * @route   PUT /api/curriculum/:id
 * @desc    Update curriculum
 * @access  Private (Admin only)
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(curriculumValidator.updateCurriculumSchema),
    curriculumController.update
);

/**
 * @route   DELETE /api/curriculum/:id
 * @desc    Delete curriculum
 * @access  Private (Admin only)
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(curriculumValidator.getCurriculumByIdSchema),
    curriculumController.deleteCurriculum
);

/**
 * @route   POST /api/curriculum/:id/courses
 * @desc    Add course to curriculum
 * @access  Private (Admin only)
 */
router.post(
    "/:id/courses",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(curriculumValidator.addCourseSchema),
    curriculumController.addCourse
);

/**
 * @route   DELETE /api/curriculum/:id/courses/:courseId
 * @desc    Remove course from curriculum
 * @access  Private (Admin only)
 */
router.delete(
    "/:id/courses/:courseId",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(curriculumValidator.removeCourseSchema),
    curriculumController.removeCourse
);

/**
 * @route   PUT /api/curriculum/:id/courses/:courseId
 * @desc    Update course in curriculum
 * @access  Private (Admin only)
 */
router.put(
    "/:id/courses/:courseId",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(curriculumValidator.updateCourseSchema),
    curriculumController.updateCourse
);

export default router;
