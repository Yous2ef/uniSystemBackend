import { Request, Response } from "express";
import reportsService from "./reports.service";
import { StatisticsResponse, TranscriptResponse } from "./reports.types";

class ReportsController {
    /**
     * Get system statistics
     */
    async getSystemStatistics(req: Request, res: Response) {
        try {
            const statistics = await reportsService.getSystemStatistics();

            const response: StatisticsResponse = {
                success: true,
                data: statistics,
            };

            res.json(response);
        } catch (error) {
            console.error("Error getting system statistics:", error);
            res.status(500).json({
                success: false,
                message: "حدث خطأ في جلب الإحصائيات",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    /**
     * Get student transcript
     */
    async getStudentTranscript(req: Request, res: Response) {
        try {
            const { studentId } = req.params;

            if (!studentId) {
                return res.status(400).json({
                    success: false,
                    message: "معرف الطالب مطلوب",
                });
            }

            const transcript = await reportsService.getStudentTranscript(
                studentId
            );

            const response: TranscriptResponse = {
                success: true,
                data: transcript,
            };

            res.json(response);
        } catch (error) {
            console.error("Error getting student transcript:", error);
            res.status(500).json({
                success: false,
                message: "حدث خطأ في جلب كشف الدرجات",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    /**
     * Get grades report for a term
     */
    async getGradesReport(req: Request, res: Response) {
        try {
            const { termId } = req.params;

            if (!termId) {
                return res.status(400).json({
                    success: false,
                    message: "معرف الفصل الدراسي مطلوب",
                });
            }

            const report = await reportsService.getGradesReport(termId);

            res.json({
                success: true,
                data: report,
            });
        } catch (error) {
            console.error("Error getting grades report:", error);
            res.status(500).json({
                success: false,
                message: "حدث خطأ في جلب تقرير الدرجات",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    /**
     * Get attendance report for a term
     */
    async getAttendanceReport(req: Request, res: Response) {
        try {
            const { termId } = req.params;

            if (!termId) {
                return res.status(400).json({
                    success: false,
                    message: "معرف الفصل الدراسي مطلوب",
                });
            }

            const report = await reportsService.getAttendanceReport(termId);

            res.json({
                success: true,
                data: report,
            });
        } catch (error) {
            console.error("Error getting attendance report:", error);
            res.status(500).json({
                success: false,
                message: "حدث خطأ في جلب تقرير الحضور",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}

export default new ReportsController();
