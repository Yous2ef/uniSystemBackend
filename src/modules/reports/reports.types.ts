export interface SystemStatistics {
    totalStudents: number;
    activeStudents: number;
    graduatedStudents: number;
    averageGPA: number;
    enrollmentRate: number;
    attendanceRate: number;
    topSpecializations: {
        name: string;
        count: number;
    }[];
    gradeDistribution: {
        grade: string;
        count: number;
        percentage: number;
    }[];
}

export interface StatisticsResponse {
    success: boolean;
    data: SystemStatistics;
}

export interface TranscriptCourse {
    code: string;
    name: string;
    credits: number;
    grade: string;
    points: number;
}

export interface TranscriptTerm {
    name: string;
    gpa: number;
    courses: TranscriptCourse[];
}

export interface StudentTranscript {
    studentCode: string;
    nameAr: string;
    specialization: string;
    batch: string;
    currentGPA: number;
    totalCredits: number;
    terms: TranscriptTerm[];
}

export interface TranscriptResponse {
    success: boolean;
    data: StudentTranscript;
}

export interface GradeReportStudent {
    studentCode: string;
    nameAr: string;
    courses: {
        code: string;
        name: string;
        midterm: number | null;
        final: number | null;
        total: number | null;
        grade: string | null;
    }[];
    termGPA: number | null;
}

export interface GradeReport {
    termName: string;
    students: GradeReportStudent[];
    averageGPA: number;
}

export interface AttendanceReportStudent {
    studentCode: string;
    nameAr: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
}

export interface AttendanceReport {
    termName: string;
    students: AttendanceReportStudent[];
    overallAttendanceRate: number;
    regularStudents: number;
    poorStudents: number;
}
