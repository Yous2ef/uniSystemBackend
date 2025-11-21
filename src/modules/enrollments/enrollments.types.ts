export interface EnrollStudentDTO {
    studentId: string;
    sectionId: string;
    bypassValidation?: boolean; // For admin override
}

export interface DropEnrollmentDTO {
    enrollmentId: string;
}

export interface GetEnrollmentsQueryDTO {
    studentId?: string;
    sectionId?: string;
    termId?: string;
    status?: "ENROLLED" | "DROPPED" | "WITHDRAWN" | "COMPLETED";
}

export interface EnrollmentWithDetails {
    id: string;
    status: "ENROLLED" | "DROPPED" | "WITHDRAWN" | "COMPLETED";
    enrolledAt: Date;
    droppedAt: Date | null;
    student: {
        id: string;
        studentCode: string;
        user: {
            email: string;
        };
        batch: {
            name: string;
        };
    };
    section: {
        id: string;
        code: string;
        capacity: number;
        course: {
            id: string;
            code: string;
            nameEn: string;
            nameAr: string;
            credits: number;
        };
        term: {
            id: string;
            name: string;
            type: string;
        };
    };
    createdAt: Date;
}

export interface EnrollmentValidationResult {
    valid: boolean;
    errors: string[];
}
