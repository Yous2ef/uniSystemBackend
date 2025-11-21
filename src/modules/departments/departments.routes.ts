import { Router } from "express";
import { departmentsController } from "./departments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    createDepartmentSchema,
    updateDepartmentSchema,
    departmentIdSchema,
    departmentQuerySchema,
} from "./departments.validator";
import { roleMiddleware } from "../../middlewares/permission.middleware";

const router = Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Public
 */
router.get(
    "/",
    validateRequest(departmentQuerySchema),
    departmentsController.getAll.bind(departmentsController)
);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Public
 */
router.get(
    "/:id",
    validateRequest(departmentIdSchema),
    departmentsController.getById.bind(departmentsController)
);

/**
 * @route   GET /api/departments/:id/specializations
 * @desc    Get department specializations
 * @access  Public
 */
router.get(
    "/:id/specializations",
    validateRequest(departmentIdSchema),
    departmentsController.getSpecializations.bind(departmentsController)
);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin, Super Admin only)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(createDepartmentSchema),
    departmentsController.create.bind(departmentsController)
);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Admin, Super Admin only)
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN", "ADMIN"),
    validateRequest(updateDepartmentSchema),
    departmentsController.update.bind(departmentsController)
);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department
 * @access  Private (Super Admin only)
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("SUPER_ADMIN"),
    validateRequest(departmentIdSchema),
    departmentsController.delete.bind(departmentsController)
);

export default router;
