import { Request, Response, NextFunction } from "express";
import batchesService from "./batches.service";
import { CreateBatchDTO, UpdateBatchDTO } from "./batches.types";

/**
 * Get all batches with filtering and pagination
 */
export const getAllBatches = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const batches = await batchesService.getAllBatches(req.query);
        res.json(batches);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific batch by ID
 */
export const getBatchById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const batch = await batchesService.getBatchById(id);

        if (!batch) {
            res.status(404).json({
                error: "Batch not found",
                message: `Batch with ID ${id} does not exist`,
            });
            return;
        }

        res.json(batch);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new batch
 */
export const createBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const batchData: CreateBatchDTO = req.body;
        const newBatch = await batchesService.createBatch(batchData);
        res.status(201).json(newBatch);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing batch
 */
export const updateBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const batchData: UpdateBatchDTO = req.body;

        const updatedBatch = await batchesService.updateBatch(id, batchData);

        if (!updatedBatch) {
            res.status(404).json({
                error: "Batch not found",
                message: `Batch with ID ${id} does not exist`,
            });
            return;
        }

        res.json(updatedBatch);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a batch
 */
export const deleteBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const result = await batchesService.deleteBatch(id);

        res.json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Get statistics for a specific batch
 */
export const getBatchStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const stats = await batchesService.getBatchStatistics(id);

        if (!stats) {
            res.status(404).json({
                success: false,
                error: "Batch not found",
                message: `Batch with ID ${id} does not exist`,
            });
            return;
        }

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};
