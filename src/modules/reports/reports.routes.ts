import { Router } from "express";
import reportsController from "./reports.controller";

const router = Router();

/**
 * @route   GET /api/reports/statistics
 * @desc    Get system-wide statistics
 * @access  Admin
 */
router.get("/statistics", reportsController.getSystemStatistics);

/**
 * @route   GET /api/reports/transcript/:studentId
 * @desc    Get student transcript
 * @access  Admin, Self
 */
router.get("/transcript/:studentId", reportsController.getStudentTranscript);

/**
 * @route   GET /api/reports/grades/:termId
 * @desc    Get grades report for a term
 * @access  Admin
 */
router.get("/grades/:termId", reportsController.getGradesReport);

/**
 * @route   GET /api/reports/attendance/:termId
 * @desc    Get attendance report for a term
 * @access  Admin
 */
router.get("/attendance/:termId", reportsController.getAttendanceReport);

export default router;
