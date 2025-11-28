import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
// Use /tmp in serverless environments (Netlify), otherwise use local uploads folder
const uploadsDir = process.env.NETLIFY
    ? "/tmp/uploads"
    : path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
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
