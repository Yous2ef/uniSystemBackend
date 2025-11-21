import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import enrollmentsService from "./enrollments.service";
import { EnrollStudentDTO } from "./enrollments.types";

export const getAllEnrollments = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const enrollments = await enrollmentsService.getAllEnrollments(
            req.query
        );
        res.json({ success: true, data: enrollments });
    } catch (error) {
        next(error);
    }
};

export const getMyEnrollments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Get student record from userId
        const enrollments = await enrollmentsService.getEnrollmentsByUserId(
            userId,
            req.query
        );
        res.json({ success: true, data: enrollments });
    } catch (error) {
        next(error);
    }
};

export const getEnrollmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const enrollment = await enrollmentsService.getEnrollmentById(id);

        if (!enrollment) {
            res.status(404).json({ error: "Enrollment not found" });
            return;
        }

        res.json(enrollment);
    } catch (error) {
        next(error);
    }
};

export const enrollStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: EnrollStudentDTO = req.body;
        const enrollment = await enrollmentsService.enrollStudent(data);
        res.status(201).json(enrollment);
    } catch (error) {
        next(error);
    }
};

export const dropEnrollment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { bypassTimeCheck } = req.body; // For admin override
        const enrollment = await enrollmentsService.dropEnrollment(
            id,
            bypassTimeCheck || false
        );
        res.json(enrollment);
    } catch (error) {
        next(error);
    }
};

export const validateEnrollment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentId, sectionId } = req.body;
        const validation = await enrollmentsService.validateEnrollment(
            studentId,
            sectionId
        );
        res.json(validation);
    } catch (error) {
        next(error);
    }
};

export const getStudentSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentId, termId } = req.params;
        const schedule = await enrollmentsService.getStudentSchedule(
            studentId,
            termId
        );
        res.json(schedule);
    } catch (error) {
        next(error);
    }
};
