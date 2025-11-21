import { Request, Response, NextFunction } from "express";
import { departmentSelectionService } from "./department-selection.service";

interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const getAvailableDepartments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const departments =
            await departmentSelectionService.getAvailableDepartments(userId);
        res.json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
};

export const getStudentEligibility = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const eligibility =
            await departmentSelectionService.getStudentEligibility(userId);
        res.json({ success: true, data: eligibility });
    } catch (error) {
        next(error);
    }
};

export const getMyApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const application = await departmentSelectionService.getMyApplication(
            userId
        );
        res.json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
};

export const applyToDepartment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const result = await departmentSelectionService.applyToDepartment(
            userId,
            req.body
        );
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const withdrawApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const { applicationId } = req.params;
        const result = await departmentSelectionService.withdrawApplication(
            userId,
            applicationId
        );
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getAllApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status, departmentId, batchId } = req.query;
        const applications =
            await departmentSelectionService.getAllApplications({
                status: status as string,
                departmentId: departmentId as string,
                batchId: batchId as string,
            });
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
};

export const processApplication = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const adminUserId = req.user?.userId;
        if (!adminUserId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const { applicationId } = req.params;
        const result = await departmentSelectionService.processApplication(
            applicationId,
            req.body,
            adminUserId
        );
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const stats = await departmentSelectionService.getStatistics();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
