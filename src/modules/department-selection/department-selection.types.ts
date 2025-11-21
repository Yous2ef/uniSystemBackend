export interface DepartmentEligibility {
    departmentId: string;
    departmentCode: string;
    departmentNameAr: string;
    departmentNameEn: string;
    collegeNameAr: string;
    minGpa: number;
    capacity: number;
    enrolledCount: number;
    availableSeats: number;
    description?: string;
    isEligible: boolean;
    eligibilityReasons: {
        hasMinimumGPA: boolean;
        hasAvailableSeats: boolean;
        isCorrectYear: boolean;
        hasNoExistingDepartment: boolean;
        hasNoPendingApplication: boolean;
        isGoodAcademicStanding: boolean;
    };
}

export interface StudentEligibilityStatus {
    canApply: boolean;
    studentGpa: number;
    currentYear: number;
    hasDepartment: boolean;
    hasPendingApplication: boolean;
    academicStanding: string;
    reasons: string[];
}

export interface ApplyDepartmentDTO {
    departmentId: string;
    statement?: string;
}

export interface ProcessApplicationDTO {
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string;
}

export interface DepartmentApplicationResponse {
    id: string;
    studentId: string;
    studentCode: string;
    studentNameAr: string;
    studentNameEn: string;
    departmentId: string;
    departmentNameAr: string;
    departmentCode: string;
    status: string;
    studentGpa: number;
    statement?: string;
    submittedAt: string;
    processedAt?: string;
    processedBy?: string;
    rejectionReason?: string;
}
