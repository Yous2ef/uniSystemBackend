import { Request, Response, NextFunction } from "express";
import { collegesService } from "./colleges.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class CollegesController {
    /**
     * Get all colleges
     */
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                search,
                page = 1,
                limit = 10,
                sortBy = "nameEn",
                sortOrder = "asc",
            } = req.query;

            const result = await collegesService.getAll({
                search: search as string,
                page: Number(page),
                limit: Number(limit),
                sortBy: sortBy as string,
                sortOrder: sortOrder as "asc" | "desc",
            });

            res.status(200).json({
                success: true,
                message: "Colleges retrieved successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get college by ID
     */
    async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const college = await collegesService.getById(id);

            res.status(200).json({
                success: true,
                message: "College retrieved successfully",
                data: college,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new college
     */
    async create(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { nameEn, nameAr, code, description } = req.body;

            const college = await collegesService.create({
                nameEn,
                nameAr,
                code,
                description,
            });

            res.status(201).json({
                success: true,
                message: "College created successfully",
                data: college,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update college
     */
    async update(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const college = await collegesService.update(id, updateData);

            res.status(200).json({
                success: true,
                message: "College updated successfully",
                data: college,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete college
     */
    async delete(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            await collegesService.delete(id);

            res.status(200).json({
                success: true,
                message: "College deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get college departments
     */
    async getDepartments(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const departments = await collegesService.getDepartments(id);

            res.status(200).json({
                success: true,
                message: "College departments retrieved successfully",
                data: departments,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const collegesController = new CollegesController();
