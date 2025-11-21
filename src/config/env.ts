import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",

    database: {
        url: process.env.DATABASE_URL!,
    },

    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET!,
        refreshSecret: process.env.JWT_REFRESH_SECRET!,
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
    },

    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
        maxRequests:
            process.env.NODE_ENV === "development"
                ? 999999
                : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    },
};
