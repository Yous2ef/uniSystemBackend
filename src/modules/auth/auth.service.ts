import prisma from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/auth";
import { Role } from "@prisma/client";

interface RegisterInput {
    email: string;
    password: string;
    role?: Role;
}

interface LoginInput {
    email: string;
    password: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterInput) {
        const { email, password, role = "STUDENT" } = data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError("Email already registered", 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            role: user.role,
        });

        // Save refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        return {
            user,
            accessToken,
            refreshToken,
        };
    }

    /**
     * Login user
     */
    async login(data: LoginInput) {
        const { email, password } = data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        // Check if user is active
        if (user.status !== "ACTIVE") {
            throw new AppError("Account is not active", 403);
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            role: user.role,
        });

        // Delete old sessions for this user to avoid duplicates
        await prisma.session.deleteMany({
            where: { userId: user.id },
        });

        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string) {
        try {
            // Verify refresh token
            const decoded = verifyRefreshToken(refreshToken);

            // Check if session exists and is valid
            const session = await prisma.session.findUnique({
                where: { token: refreshToken },
                include: { user: true },
            });

            if (!session || session.expiresAt < new Date()) {
                throw new AppError("Invalid or expired refresh token", 401);
            }

            // Generate new access token
            const accessToken = generateAccessToken({
                userId: decoded.userId,
                role: decoded.role,
            });

            return {
                accessToken,
                user: {
                    id: session.user.id,
                    email: session.user.email,
                    role: session.user.role,
                },
            };
        } catch (error) {
            throw new AppError("Invalid refresh token", 401);
        }
    }

    /**
     * Logout user
     */
    async logout(refreshToken: string) {
        await prisma.session.deleteMany({
            where: { token: refreshToken },
        });

        return { message: "Logged out successfully" };
    }

    /**
     * Get current user
     */
    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                student: {
                    select: {
                        studentCode: true,
                        nameEn: true,
                        nameAr: true,
                        phone: true,
                        status: true,
                    },
                },
                faculty: {
                    select: {
                        staffCode: true,
                        nameEn: true,
                        nameAr: true,
                        phone: true,
                        type: true,
                    },
                },
            },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        return user;
    }

    /**
     * Change password
     */
    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new AppError("User not found", 404);
        }

        // Verify old password
        const isPasswordValid = await comparePassword(
            oldPassword,
            user.password
        );

        if (!isPasswordValid) {
            throw new AppError("Invalid old password", 400);
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Delete all sessions (force re-login)
        await prisma.session.deleteMany({
            where: { userId },
        });

        return { message: "Password changed successfully" };
    }
}
