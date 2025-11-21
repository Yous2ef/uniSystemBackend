export interface CreateBatchDTO {
    name: string;
    year: number;
    departmentId: string;
    curriculumId: string;
    maxCredits?: number;
    minCredits?: number;
    admissionQuota?: number;
}

export interface UpdateBatchDTO {
    name?: string;
    maxCredits?: number;
    minCredits?: number;
}

export interface BatchWithDetails {
    id: string;
    name: string;
    year: number;
    maxCredits: number;
    minCredits: number;
    studentsCount: number;
    department: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
    };
    curriculum: {
        id: string;
        name: string;
        version: string;
        totalCredits: number;
    };
    createdAt: Date;
}
