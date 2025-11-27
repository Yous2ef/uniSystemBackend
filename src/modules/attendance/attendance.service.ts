import prisma from "../../config/database";
import {
    MarkAttendanceDTO,
    UpdateAttendanceDTO,
    AttendanceWithDetails,
    AttendanceStats,
} from "./attendance.types";

export class AttendanceService {
    async getAllAttendance(filters?: {
        enrollmentId?: string;
        sectionId?: string;
        studentId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<AttendanceWithDetails[]> {
        const where: any = {};

        if (filters?.enrollmentId) {
            where.enrollmentId = filters.enrollmentId;
        }

        if (filters?.sectionId || filters?.studentId) {
            where.enrollment = {};
            if (filters.sectionId) {
                where.enrollment.sectionId = filters.sectionId;
            }
            if (filters.studentId) {
                where.enrollment.studentId = filters.studentId;
            }
        }

        if (filters?.startDate || filters?.endDate) {
            where.sessionDate = {};
            if (filters.startDate) {
                where.sessionDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.sessionDate.lte = filters.endDate;
            }
        }

        const attendances = await prisma.attendance.findMany({
            where,
            include: {
                enrollment: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                studentCode: true,
                                nameEn: true,
                                nameAr: true,
                            },
                        },
                        section: {
                            include: {
                                course: {
                                    select: {
                                        code: true,
                                        nameEn: true,
                                        nameAr: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { sessionDate: "desc" },
        });

        return attendances.map((a) => ({
            id: a.id,
            sessionDate: a.sessionDate,
            status: a.status,
            excuse: a.excuse,
            enrollment: {
                id: a.enrollment.id,
                student: a.enrollment.student,
                section: {
                    id: a.enrollment.section.id,
                    code: a.enrollment.section.code,
                    course: a.enrollment.section.course,
                },
            },
            createdAt: a.createdAt,
        }));
    }

    async getAttendanceById(id: string): Promise<AttendanceWithDetails | null> {
        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: {
                enrollment: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                studentCode: true,
                                nameEn: true,
                                nameAr: true,
                            },
                        },
                        section: {
                            include: {
                                course: {
                                    select: {
                                        code: true,
                                        nameEn: true,
                                        nameAr: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!attendance) return null;

        return {
            id: attendance.id,
            sessionDate: attendance.sessionDate,
            status: attendance.status,
            excuse: attendance.excuse,
            enrollment: {
                id: attendance.enrollment.id,
                student: attendance.enrollment.student,
                section: {
                    id: attendance.enrollment.section.id,
                    code: attendance.enrollment.section.code,
                    course: attendance.enrollment.section.course,
                },
            },
            createdAt: attendance.createdAt,
        };
    }

    async markAttendance(data: MarkAttendanceDTO) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: data.enrollmentId },
        });

        if (!enrollment) {
            throw new Error("Enrollment not found");
        }

        if (enrollment.status !== "ENROLLED") {
            throw new Error("Can only mark attendance for enrolled students");
        }

        const existing = await prisma.attendance.findFirst({
            where: {
                enrollmentId: data.enrollmentId,
                sessionDate: data.sessionDate,
            },
        });

        if (existing) {
            throw new Error("Attendance already marked for this session");
        }

        const attendance = await prisma.attendance.create({
            data: {
                enrollmentId: data.enrollmentId,
                sessionDate: data.sessionDate,
                status: data.status,
                excuse: data.excuse,
            },
            include: {
                enrollment: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                studentCode: true,
                                nameEn: true,
                                nameAr: true,
                            },
                        },
                        section: {
                            include: {
                                course: {
                                    select: {
                                        code: true,
                                        nameEn: true,
                                        nameAr: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return attendance;
    }

    async updateAttendance(id: string, data: UpdateAttendanceDTO) {
        const existing = await prisma.attendance.findUnique({
            where: { id },
        });

        if (!existing) {
            return null;
        }

        const updated = await prisma.attendance.update({
            where: { id },
            data: {
                status: data.status,
                excuse: data.excuse,
            },
        });

        return updated;
    }

    async deleteAttendance(id: string) {
        const attendance = await prisma.attendance.findUnique({
            where: { id },
        });

        if (!attendance) {
            throw new Error("Attendance record not found");
        }

        await prisma.attendance.delete({
            where: { id },
        });

        return { message: "Attendance record deleted successfully" };
    }

    async getAttendanceStats(enrollmentId: string): Promise<AttendanceStats> {
        const attendances = await prisma.attendance.findMany({
            where: { enrollmentId },
        });

        const totalSessions = attendances.length;
        const presentCount = attendances.filter(
            (a) => a.status === "PRESENT"
        ).length;
        const absentCount = attendances.filter(
            (a) => a.status === "ABSENT"
        ).length;
        const excusedCount = attendances.filter(
            (a) => a.status === "EXCUSED"
        ).length;

        const attendancePercentage =
            totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

        return {
            totalSessions,
            presentCount,
            absentCount,
            excusedCount,
            attendancePercentage,
        };
    }

    async getSectionAttendance(sectionId: string, sessionDate?: Date) {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                sectionId,
                status: "ENROLLED",
            },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                attendances: sessionDate
                    ? {
                          where: {
                              sessionDate,
                          },
                      }
                    : true,
            },
        });

        return enrollments.map((e) => ({
            enrollment: {
                id: e.id,
                student: e.student,
            },
            attendance: sessionDate ? e.attendances[0] || null : e.attendances,
        }));
    }
}

export default new AttendanceService();
