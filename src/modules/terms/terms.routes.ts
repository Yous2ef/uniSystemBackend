import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    getAllTerms,
    getTermById,
    createTerm,
    updateTerm,
    deleteTerm,
    getTermStatistics,
} from "./terms.controller";
import {
    createTermSchema,
    updateTermSchema,
    getTermSchema,
    deleteTermSchema,
} from "./terms.validator";

const router = Router();

/**
 * @route   GET /api/terms
 * @desc    Get all terms with filtering
 * @access  Private
 */
router.get("/", authMiddleware, getAllTerms);

/**
 * @route   GET /api/terms/:id
 * @desc    Get a specific term by ID
 * @access  Private
 */
router.get("/:id", authMiddleware, validateRequest(getTermSchema), getTermById);

/**
 * @route   POST /api/terms
 * @desc    Create a new term
 * @access  Private (Admin)
 */
router.post("/", authMiddleware, validateRequest(createTermSchema), createTerm);

/**
 * @route   PUT /api/terms/:id
 * @desc    Update an existing term
 * @access  Private (Admin)
 */
router.put(
    "/:id",
    authMiddleware,
    validateRequest(updateTermSchema),
    updateTerm
);

/**
 * @route   DELETE /api/terms/:id
 * @desc    Delete a term
 * @access  Private (Admin)
 */
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(deleteTermSchema),
    deleteTerm
);

/**
 * @route   GET /api/terms/:id/stats
 * @desc    Get statistics for a specific term
 * @access  Private
 */
router.get(
    "/:id/stats",
    authMiddleware,
    validateRequest(getTermSchema),
    getTermStatistics
);

export default router;
