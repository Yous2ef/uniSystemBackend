import { Request, Response, NextFunction } from "express";
import facultyService from "./faculty.service";
import { CreateFacultyDTO, UpdateFacultyDTO } from "./faculty.types";

/**
 * Get all faculty members
 */
export const getAllFaculty = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const faculty = await facultyService.getAllFaculty(req.query);
        res.json({
            success: true,
            data: { faculty },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get faculty by ID
 */
export const getFacultyById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const faculty = await facultyService.getFacultyById(id);

        if (!faculty) {
            res.status(404).json({
                success: false,
                error: "Faculty not found",
            });
            return;
        }

        res.json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new faculty member
 */
export const createFaculty = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: CreateFacultyDTO = req.body;
        const faculty = await facultyService.createFaculty(data);
        res.status(201).json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update faculty member
 */
export const updateFaculty = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const data: UpdateFacultyDTO = req.body;
        const faculty = await facultyService.updateFaculty(id, data);

        if (!faculty) {
            res.status(404).json({
                success: false,
                error: "Faculty not found",
            });
            return;
        }

        res.json({
            success: true,
            data: faculty,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete faculty member
 */
export const deleteFaculty = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const result = await facultyService.deleteFaculty(id);
        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get faculty sections
 */
export const getFacultySections = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { termId } = req.query;
        const sections = await facultyService.getFacultySections(
            id,
            termId as string
        );
        res.json({
            success: true,
            data: { sections },
        });
    } catch (error) {
        next(error);
    }
};
