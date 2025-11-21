export interface MarkAttendanceDTO {
    enrollmentId: string;
    sessionDate: Date;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    excuse?: string;
}

export interface UpdateAttendanceDTO {
    status?: "PRESENT" | "ABSENT" | "EXCUSED";
    excuse?: string;
}

export interface AttendanceWithDetails {
    id: string;
    sessionDate: Date;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    excuse: string | null;
    enrollment: {
        id: string;
        student: {
            id: string;
            studentCode: string;
            nameEn: string;
            nameAr: string;
        };
        section: {
            id: string;
            code: string;
            course: {
                code: string;
                nameEn: string;
                nameAr: string;
            };
        };
    };
    createdAt: Date;
}

export interface AttendanceStats {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    excusedCount: number;
    attendancePercentage: number;
}
