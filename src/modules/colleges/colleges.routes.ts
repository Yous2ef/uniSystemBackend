import { Router } from "express";
import { collegesController } from "./colleges.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    createCollegeSchema,
    updateCollegeSchema,
    collegeIdSchema,
    collegeQuerySchema,
} from "./colleges.validator";
import { roleMiddleware } from "../../middlewares/permission.middleware";

const router = Router();

/**
 * @route   GET /api/colleges
 * @desc    Get all colleges
 * @access  Public (or authenticated users)
 */
router.get(
    "/",
    validateRequest(collegeQuerySchema),
    collegesController.getAll.bind(collegesController)
);

/**
 * @route   GET /api/colleges/:id
 * @desc    Get college by ID
 * @access  Public (or authenticated users)
 */
router.get(
    "/:id",
    validateRequest(collegeIdSchema),
    collegesController.getById.bind(collegesController)
);

/**
 * @route   GET /api/colleges/:id/departments
 * @desc    Get college departments
 * @access  Public (or authenticated users)
 */
router.get(
    "/:id/departments",
    validateRequest(collegeIdSchema),
    collegesController.getDepartments.bind(collegesController)
);

/**
 * @route   POST /api/colleges
 * @desc    Create new college
 * @access  Private (Admin, Super Admin only)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(createCollegeSchema),
    collegesController.create.bind(collegesController)
);

/**
 * @route   PUT /api/colleges/:id
 * @desc    Update college
 * @access  Private (Admin, Super Admin only)
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(updateCollegeSchema),
    collegesController.update.bind(collegesController)
);

/**
 * @route   DELETE /api/colleges/:id
 * @desc    Delete college
 * @access  Private (Super Admin only)
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN"),
    validateRequest(collegeIdSchema),
    collegesController.delete.bind(collegesController)
);

export default router;
