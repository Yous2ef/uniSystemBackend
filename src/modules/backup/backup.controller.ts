import { Request, Response, NextFunction } from "express";
import backupService from "./backup.service";
import fs from "fs/promises";

export const createBackup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await backupService.createBackup();
        res.json({
            success: true,
            message: "تم إنشاء النسخة الاحتياطية بنجاح",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const listBackups = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const backups = await backupService.listBackups();
        res.json({
            success: true,
            data: backups,
        });
    } catch (error) {
        next(error);
    }
};

export const restoreBackup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: "Filename is required",
            });
        }

        const result = await backupService.restoreFromFile(filename);
        res.json({
            success: true,
            message: "تم استعادة النسخة الاحتياطية بنجاح",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const uploadAndRestore = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const result = await backupService.restoreBackup(req.file.path);

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        return res.json({
            success: true,
            message: "تم استعادة قاعدة البيانات بنجاح",
            data: result,
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch {}
        }
        next(error);
    }
};

export const deleteBackup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { filename } = req.params;
        const result = await backupService.deleteBackup(filename);
        res.json({
            success: true,
            message: "تم حذف النسخة الاحتياطية بنجاح",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const downloadBackup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { filename } = req.params;
        const filePath = await backupService.getBackupFilePath(filename);

        res.download(filePath, filename, (err) => {
            if (err) {
                next(err);
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getBackupStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const stats = await backupService.getBackupStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

export const getSystemStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const stats = await backupService.getSystemStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

export const exportData = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { type } = req.params;
        const result = await backupService.exportData(type);

        // Set headers for file download
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${type}-export-${new Date().toISOString()}.json"`
        );

        res.json(result.data);
    } catch (error) {
        next(error);
    }
};

export const clearCache = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await backupService.clearCache();
        res.json({
            success: true,
            message: "تم مسح ذاكرة التخزين المؤقت بنجاح",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAllData = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await backupService.deleteAllData();
        res.json({
            success: true,
            message: "تم حذف جميع البيانات بنجاح (ماعدا حساب الأدمن)",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
