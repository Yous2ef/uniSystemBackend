import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    getAllBatches,
    getBatchById,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchStatistics,
} from "./batches.controller";
import {
    createBatchSchema,
    updateBatchSchema,
    getBatchSchema,
    deleteBatchSchema,
} from "./batches.validator";

const router = Router();

/**
 * @route   GET /api/batches
 * @desc    Get all batches with filtering and pagination
 * @access  Private
 */
router.get("/", authMiddleware, getAllBatches);

/**
 * @route   GET /api/batches/:id
 * @desc    Get a specific batch by ID
 * @access  Private
 */
router.get(
    "/:id",
    authMiddleware,
    validateRequest(getBatchSchema),
    getBatchById
);

/**
 * @route   POST /api/batches
 * @desc    Create a new batch
 * @access  Private (Admin)
 */
router.post(
    "/",
    authMiddleware,
    validateRequest(createBatchSchema),
    createBatch
);

/**
 * @route   PUT /api/batches/:id
 * @desc    Update an existing batch
 * @access  Private (Admin)
 */
router.put(
    "/:id",
    authMiddleware,
    validateRequest(updateBatchSchema),
    updateBatch
);

/**
 * @route   DELETE /api/batches/:id
 * @desc    Delete a batch
 * @access  Private (Admin)
 */
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(deleteBatchSchema),
    deleteBatch
);

/**
 * @route   GET /api/batches/:id/stats
 * @desc    Get statistics for a specific batch
 * @access  Private
 */
router.get(
    "/:id/stats",
    authMiddleware,
    validateRequest(getBatchSchema),
    getBatchStatistics
);

export default router;
