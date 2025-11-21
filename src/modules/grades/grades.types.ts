export interface CreateGradeComponentDTO {
    sectionId: string;
    name: string;
    weight: number;
    maxScore: number;
}

export interface UpdateGradeComponentDTO {
    name?: string;
    weight?: number;
    maxScore?: number;
}

export interface RecordGradeDTO {
    enrollmentId: string;
    componentId: string;
    score: number;
}

export interface UpdateGradeDTO {
    score?: number;
}

export interface PublishFinalGradesDTO {
    sectionId: string;
}

export interface GradeComponentWithDetails {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
    section: {
        id: string;
        code: string;
        course: {
            code: string;
            nameEn: string;
            nameAr: string;
        };
    };
    createdAt: Date;
}

export interface StudentGradesReport {
    student: {
        id: string;
        studentCode: string;
        nameEn: string;
        nameAr: string;
    };
    course: {
        code: string;
        nameEn: string;
        credits: number;
    };
    section: {
        code: string;
    };
    components: {
        id: string;
        name: string;
        weight: number;
        maxScore: number;
        score: number | null;
        percentage: number | null;
    }[];
    totalScore: number;
    finalGrade: {
        letterGrade: string;
        gradePoint: number;
        status: string;
    } | null;
}

export interface GPACalculation {
    termGPA: number;
    cumulativeGPA: number;
    creditsEarned: number;
    creditsAttempted: number;
    totalCredits: number;
    academicStanding: string;
}
