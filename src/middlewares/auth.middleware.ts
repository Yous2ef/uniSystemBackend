import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth";
import { AppError } from "./error.middleware";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("No token provided", 401);
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            return next(new AppError("Token expired", 401));
        }
        if (error instanceof Error && error.name === "JsonWebTokenError") {
            return next(new AppError("Invalid token", 401));
        }
        next(error);
    }
};
