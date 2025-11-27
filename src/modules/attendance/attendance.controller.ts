import { Request, Response, NextFunction } from "express";
import attendanceService from "./attendance.service";
import { MarkAttendanceDTO, UpdateAttendanceDTO } from "./attendance.types";

export const getAllAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const attendances = await attendanceService.getAllAttendance(req.query);
        res.json(attendances);
    } catch (error) {
        next(error);
    }
};

export const getAttendanceById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const attendance = await attendanceService.getAttendanceById(id);

        if (!attendance) {
            res.status(404).json({ error: "Attendance record not found" });
            return;
        }

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

export const markAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: MarkAttendanceDTO = req.body;
        const attendance = await attendanceService.markAttendance(data);
        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};

export const updateAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const data: UpdateAttendanceDTO = req.body;
        const attendance = await attendanceService.updateAttendance(id, data);

        if (!attendance) {
            res.status(404).json({ error: "Attendance record not found" });
            return;
        }

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

export const deleteAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const result = await attendanceService.deleteAttendance(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getAttendanceStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { enrollmentId } = req.params;
        const stats = await attendanceService.getAttendanceStats(enrollmentId);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const getSectionAttendance = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { sectionId } = req.params;
        const { sessionDate } = req.query;
        const attendance = await attendanceService.getSectionAttendance(
            sectionId,
            sessionDate ? new Date(sessionDate as string) : undefined
        );
        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};
