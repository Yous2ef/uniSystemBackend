import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate an access token
 */
export const generateAccessToken = (payload: {
    userId: string;
    role: string;
}): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { expiresIn: config.jwt.accessExpiry };
    return jwt.sign(payload, config.jwt.accessSecret, options);
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (payload: {
    userId: string;
    role: string;
}): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = { expiresIn: config.jwt.refreshExpiry };
    return jwt.sign(payload, config.jwt.refreshSecret, options);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (
    token: string
): { userId: string; role: string } => {
    return jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
        role: string;
    };
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (
    token: string
): { userId: string; role: string } => {
    return jwt.verify(token, config.jwt.refreshSecret) as {
        userId: string;
        role: string;
    };
};
