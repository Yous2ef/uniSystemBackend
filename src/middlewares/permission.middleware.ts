import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "./error.middleware";
import { ROLE_PERMISSIONS } from "../config/constants";
import { Role } from "@prisma/client";

export const permissionMiddleware = (requiredPermission: string) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Unauthorized", 401));
        }

        const { role } = req.user;
        const userPermissions: string[] = ROLE_PERMISSIONS[role as Role] || [];

        if (!userPermissions.includes(requiredPermission)) {
            return next(new AppError("Insufficient permissions", 403));
        }

        next();
    };
};

export const roleMiddleware = (...allowedRoles: Role[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("Unauthorized", 401));
        }

        if (!allowedRoles.includes(req.user.role as Role)) {
            return next(new AppError("Access denied", 403));
        }

        next();
    };
};
