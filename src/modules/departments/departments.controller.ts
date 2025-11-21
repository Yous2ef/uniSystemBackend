import { Request, Response, NextFunction } from "express";
import { departmentsService } from "./departments.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class DepartmentsController {
    /**
     * Get all departments
     */
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                collegeId,
                search,
                page = 1,
                limit = 10,
                sortBy = "nameEn",
                sortOrder = "asc",
            } = req.query;

            const result = await departmentsService.getAll({
                collegeId: collegeId as string,
                search: search as string,
                page: Number(page),
                limit: Number(limit),
                sortBy: sortBy as string,
                sortOrder: sortOrder as "asc" | "desc",
            });

            res.status(200).json({
                success: true,
                message: "Departments retrieved successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get department by ID
     */
    async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const department = await departmentsService.getById(id);

            res.status(200).json({
                success: true,
                message: "Department retrieved successfully",
                data: department,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new department
     */
    async create(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { collegeId, nameEn, nameAr, code, headId } = req.body;

            const department = await departmentsService.create({
                collegeId,
                nameEn,
                nameAr,
                code,
                headId,
            });

            res.status(201).json({
                success: true,
                message: "Department created successfully",
                data: department,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update department
     */
    async update(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const department = await departmentsService.update(id, updateData);

            res.status(200).json({
                success: true,
                message: "Department updated successfully",
                data: department,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete department
     */
    async delete(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            await departmentsService.delete(id);

            res.status(200).json({
                success: true,
                message: "Department deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get department specializations
     */
    async getSpecializations(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const specializations = await departmentsService.getSpecializations(
                id
            );

            res.status(200).json({
                success: true,
                message: "Department specializations retrieved successfully",
                data: specializations,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const departmentsController = new DepartmentsController();
