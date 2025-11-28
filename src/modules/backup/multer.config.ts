import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

// Create uploads directory if it doesn't exist
// Use /tmp in serverless environments (Netlify), otherwise use local uploads folder
const tmpUploadsDir = path.join(os.tmpdir(), "uploads");
const defaultUploadsDir = path.join(process.cwd(), "uploads");
const requestedUploadsDir =
    process.env.UPLOADS_DIR ||
    (process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    process.env.LAMBDA_TASK_ROOT
        ? tmpUploadsDir
        : defaultUploadsDir);

let uploadsDir = requestedUploadsDir;

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} catch (error) {
    const err = error as NodeJS.ErrnoException;
    const shouldFallback =
        uploadsDir !== tmpUploadsDir &&
        (!err?.code ||
            err.code === "EACCES" ||
            err.code === "ENOENT" ||
            err.code === "EPERM" ||
            err.code === "EROFS");

    if (!shouldFallback) {
        throw error;
    }

    uploadsDir = tmpUploadsDir;
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "backup-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    // Accept only .sql files
    if (
        file.mimetype === "application/sql" ||
        file.originalname.endsWith(".sql")
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only .sql files are allowed"));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
});
