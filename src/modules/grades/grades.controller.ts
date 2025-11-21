import { Request, Response, NextFunction } from "express";
import gradesService from "./grades.service";
import {
    CreateGradeComponentDTO,
    UpdateGradeComponentDTO,
    RecordGradeDTO,
    UpdateGradeDTO,
} from "./grades.types";

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const createGradeComponent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: CreateGradeComponentDTO = req.body;
        const component = await gradesService.createGradeComponent(data);
        res.status(201).json(component);
    } catch (error) {
        next(error);
    }
};

export const updateGradeComponent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const data: UpdateGradeComponentDTO = req.body;
        const component = await gradesService.updateGradeComponent(id, data);

        if (!component) {
            res.status(404).json({ error: "Grade component not found" });
            return;
        }

        res.json(component);
    } catch (error) {
        next(error);
    }
};

export const deleteGradeComponent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const result = await gradesService.deleteGradeComponent(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getSectionComponents = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { sectionId } = req.params;
        const components = await gradesService.getSectionComponents(sectionId);
        res.json(components);
    } catch (error) {
        next(error);
    }
};

export const recordGrade = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: RecordGradeDTO = req.body;
        const grade = await gradesService.recordGrade(data);
        res.status(201).json(grade);
    } catch (error) {
        next(error);
    }
};

export const updateGrade = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const data: UpdateGradeDTO = req.body;
        const grade = await gradesService.updateGrade(id, data);

        if (!grade) {
            res.status(404).json({ error: "Grade not found" });
            return;
        }

        res.json(grade);
    } catch (error) {
        next(error);
    }
};

export const getStudentGrades = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { enrollmentId } = req.params;
        const grades = await gradesService.getStudentGrades(enrollmentId);

        if (!grades) {
            res.status(404).json({ error: "Enrollment not found" });
            return;
        }

        res.json(grades);
    } catch (error) {
        next(error);
    }
};

export const getMyGrades = async (
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

        const grades = await gradesService.getGradesByUserId(userId);
        res.json({ success: true, data: grades });
    } catch (error) {
        next(error);
    }
};

export const publishFinalGrades = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { sectionId } = req.body;
        const result = await gradesService.publishFinalGrades(sectionId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const calculateGPA = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentId, termId } = req.params;
        const gpa = await gradesService.calculateStudentGPA(studentId, termId);
        res.json(gpa);
    } catch (error) {
        next(error);
    }
};

export const getTranscript = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { studentId } = req.params;
        const transcript = await gradesService.getStudentTranscript(studentId);
        res.json(transcript);
    } catch (error) {
        next(error);
    }
};
