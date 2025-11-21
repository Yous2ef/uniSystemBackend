import { Request, Response, NextFunction } from "express";
import curriculumService from "./curriculum.service";

/**
 * Get all curricula
 */
export const getAll = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await curriculumService.getAll(req.query);
        res.json({
            success: true,
            message: "Curricula retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get curriculum by ID
 */
export const getById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const curriculum = await curriculumService.getById(req.params.id);
        res.json({
            success: true,
            message: "Curriculum retrieved successfully",
            data: curriculum,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new curriculum
 */
export const create = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const curriculum = await curriculumService.create(req.body);
        res.status(201).json({
            success: true,
            message: "Curriculum created successfully",
            data: curriculum,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update curriculum
 */
export const update = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const curriculum = await curriculumService.update(
            req.params.id,
            req.body
        );
        res.json({
            success: true,
            message: "Curriculum updated successfully",
            data: curriculum,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete curriculum
 */
export const deleteCurriculum = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await curriculumService.delete(req.params.id);
        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add course to curriculum
 */
export const addCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const curriculumCourse = await curriculumService.addCourse(
            req.params.id,
            req.body
        );
        res.status(201).json({
            success: true,
            message: "Course added to curriculum successfully",
            data: curriculumCourse,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove course from curriculum
 */
export const removeCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await curriculumService.removeCourse(
            req.params.id,
            req.params.courseId
        );
        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update course in curriculum
 */
export const updateCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const curriculumCourse = await curriculumService.updateCourse(
            req.params.id,
            req.params.courseId,
            req.body
        );
        res.json({
            success: true,
            message: "Course updated in curriculum successfully",
            data: curriculumCourse,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Validate curriculum
 */
export const validate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const validation = await curriculumService.validate(req.params.id);
        res.json({
            success: true,
            message: "Curriculum validation completed",
            data: validation,
        });
    } catch (error) {
        next(error);
    }
};
