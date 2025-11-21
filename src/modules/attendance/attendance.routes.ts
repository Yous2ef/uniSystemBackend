import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    getAllAttendance,
    getAttendanceById,
    markAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceStats,
    getSectionAttendance,
} from "./attendance.controller";
import {
    markAttendanceSchema,
    updateAttendanceSchema,
    getAttendanceSchema,
    deleteAttendanceSchema,
} from "./attendance.validator";

const router = Router();

router.get("/", authMiddleware, getAllAttendance);
router.get(
    "/:id",
    authMiddleware,
    validateRequest(getAttendanceSchema),
    getAttendanceById
);
router.post(
    "/",
    authMiddleware,
    validateRequest(markAttendanceSchema),
    markAttendance
);
router.put(
    "/:id",
    authMiddleware,
    validateRequest(updateAttendanceSchema),
    updateAttendance
);
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(deleteAttendanceSchema),
    deleteAttendance
);
router.get("/stats/:enrollmentId", authMiddleware, getAttendanceStats);
router.get("/section/:sectionId", authMiddleware, getSectionAttendance);

export default router;
