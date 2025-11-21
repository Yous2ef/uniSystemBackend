import { Request, Response, NextFunction } from "express";
import { coursesService } from "./courses.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export class CoursesController {
    /**
     * Get all courses
     */
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                search,
                type,
                page = 1,
                limit = 10,
                sortBy = "code",
                sortOrder = "asc",
            } = req.query;

            const result = await coursesService.getAll({
                search: search as string,
                type: type as "CORE" | "ELECTIVE" | "GENERAL",
                page: Number(page),
                limit: Number(limit),
                sortBy: sortBy as string,
                sortOrder: sortOrder as "asc" | "desc",
            });

            res.status(200).json({
                success: true,
                message: "Courses retrieved successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get course by ID
     */
    async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const course = await coursesService.getById(id);

            res.status(200).json({
                success: true,
                message: "Course retrieved successfully",
                data: course,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new course
     */
    async create(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { code, nameEn, nameAr, credits, type, description } =
                req.body;

            const course = await coursesService.create({
                code,
                nameEn,
                nameAr,
                credits,
                type,
                description,
            });

            res.status(201).json({
                success: true,
                message: "Course created successfully",
                data: course,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update course
     */
    async update(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const course = await coursesService.update(id, updateData);

            res.status(200).json({
                success: true,
                message: "Course updated successfully",
                data: course,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete course
     */
    async delete(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            await coursesService.delete(id);

            res.status(200).json({
                success: true,
                message: "Course deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get course prerequisites
     */
    async getPrerequisites(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const prerequisites = await coursesService.getPrerequisites(id);

            res.status(200).json({
                success: true,
                message: "Course prerequisites retrieved successfully",
                data: prerequisites,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add prerequisite to course
     */
    async addPrerequisite(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { prerequisiteId, type } = req.body;

            const prerequisite = await coursesService.addPrerequisite(
                id,
                prerequisiteId,
                type
            );

            res.status(201).json({
                success: true,
                message: "Prerequisite added successfully",
                data: prerequisite,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove prerequisite from course
     */
    async removePrerequisite(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id, prerequisiteId } = req.params;

            await coursesService.removePrerequisite(id, prerequisiteId);

            res.status(200).json({
                success: true,
                message: "Prerequisite removed successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get prerequisite tree
     */
    async getPrerequisiteTree(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            const tree = await coursesService.getPrerequisiteTree(id);

            res.status(200).json({
                success: true,
                message: "Prerequisite tree retrieved successfully",
                data: tree,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const coursesController = new CoursesController();
