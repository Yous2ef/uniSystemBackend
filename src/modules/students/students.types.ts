export interface CreateStudentDTO {
    email: string;
    password: string;
    studentCode: string;
    nameEn: string;
    nameAr: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: Date;
    gender?: "MALE" | "FEMALE";
    batchId: string;
    departmentId?: string;
    admissionDate: Date;
    status?: "ACTIVE" | "DEFERRED" | "DISMISSED" | "GRADUATED";
}

export interface UpdateStudentDTO {
    nameEn?: string;
    nameAr?: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: Date;
    gender?: "MALE" | "FEMALE";
    departmentId?: string;
    status?: "ACTIVE" | "DEFERRED" | "DISMISSED" | "GRADUATED";
}

export interface StudentProfileResponse {
    id: string;
    studentCode: string;
    nameEn: string;
    nameAr: string;
    email: string;
    phone?: string;
    nationalId?: string;
    dateOfBirth?: Date;
    gender?: string;
    admissionDate: Date;
    status: string;
    batch: {
        id: string;
        name: string;
        year: number;
        curriculum: {
            id: string;
            name: string;
            totalCredits: number;
        };
    };
    department?: {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
    };
    academicStanding?: {
        cgpa: number;
        totalCredits: number;
        standing: string;
    };
}

export interface ImportStudentsDTO {
    file: any; // Multer file
    batchId: string;
}

export interface StudentImportRow {
    studentCode: string;
    nameEn: string;
    nameAr: string;
    email: string;
    phone: string;
    nationalId: string;
    dateOfBirth: string;
    gender: "MALE" | "FEMALE";
}
