import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

const authService = new AuthService();

export class AuthController {
    /**
     * Register a new user
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);

            // Set refresh token in HTTP-only cookie
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const refreshToken =
                req.body.refreshToken || req.cookies.refreshToken;

            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    message: "Refresh token required",
                });
                return;
            }

            const result = await authService.refreshToken(refreshToken);

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     */
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken =
                req.body.refreshToken || req.cookies.refreshToken;

            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            res.clearCookie("refreshToken");

            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user
     */
    async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.getCurrentUser(req.user!.userId);

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password
     */
    async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword } = req.body;

            await authService.changePassword(
                req.user!.userId,
                oldPassword,
                newPassword
            );

            res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
