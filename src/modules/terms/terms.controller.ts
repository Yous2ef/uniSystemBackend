import { Request, Response, NextFunction } from "express";
import termsService from "./terms.service";
import { CreateTermDTO, UpdateTermDTO } from "./terms.types";

/**
 * Get all terms with filtering
 */
export const getAllTerms = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const terms = await termsService.getAllTerms(req.query);
        res.json({
            success: true,
            data: {
                terms,
                total: terms.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific term by ID
 */
export const getTermById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const term = await termsService.getTermById(id);

        if (!term) {
            res.status(404).json({
                error: "Term not found",
                message: `Term with ID ${id} does not exist`,
            });
            return;
        }

        res.json(term);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new term
 */
export const createTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const termData: CreateTermDTO = req.body;
        const newTerm = await termsService.createTerm(termData);
        res.status(201).json(newTerm);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing term
 */
export const updateTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const termData: UpdateTermDTO = req.body;

        const updatedTerm = await termsService.updateTerm(id, termData);

        if (!updatedTerm) {
            res.status(404).json({
                error: "Term not found",
                message: `Term with ID ${id} does not exist`,
            });
            return;
        }

        res.json(updatedTerm);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a term
 */
export const deleteTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const result = await termsService.deleteTerm(id);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get statistics for a specific term
 */
export const getTermStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const stats = await termsService.getTermStatistics(id);

        if (!stats) {
            res.status(404).json({
                error: "Term not found",
                message: `Term with ID ${id} does not exist`,
            });
            return;
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
