export interface CreateFacultyDTO {
    staffCode: string;
    nameEn: string;
    nameAr: string;
    email: string;
    password: string;
    phone?: string;
    type?: "FACULTY" | "TA";
}

export interface UpdateFacultyDTO {
    nameEn?: string;
    nameAr?: string;
    phone?: string;
    type?: "FACULTY" | "TA";
}

export interface FacultyWithDetails {
    id: string;
    staffCode: string;
    nameEn: string;
    nameAr: string;
    phone?: string | null;
    type: "FACULTY" | "TA";
    user: {
        email: string;
        status: string;
    };
    createdAt: Date;
}
