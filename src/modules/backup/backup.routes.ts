import { Router } from "express";
import * as backupController from "./backup.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/permission.middleware";
import { upload } from "./multer.config";

const router = Router();

// All routes require authentication and admin permission
router.use(authMiddleware);
router.use(roleMiddleware("SUPER_ADMIN", "ADMIN"));

// Backup operations
router.post("/create", backupController.createBackup);
router.get("/list", backupController.listBackups);
router.post("/restore", backupController.restoreBackup);
router.post(
    "/upload-restore",
    upload.single("file"),
    backupController.uploadAndRestore
);
router.delete("/:filename", backupController.deleteBackup);
router.get("/download/:filename", backupController.downloadBackup);

// Stats
router.get("/stats", backupController.getBackupStats);
router.get("/system-stats", backupController.getSystemStats);

// Data export
router.get("/export/:type", backupController.exportData);

// Cache
router.post("/clear-cache", backupController.clearCache);

// Delete all data
router.post("/delete-all-data", backupController.deleteAllData);

export default router;
