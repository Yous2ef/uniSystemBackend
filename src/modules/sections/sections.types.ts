export interface CreateSectionDTO {
    courseId: string;
    termId: string;
    code: string;
    facultyId: string;
    capacity: number;
    schedules?: {
        day: number;
        startTime: string;
        endTime: string;
        room?: string;
    }[];
}

export interface UpdateSectionDTO {
    code?: string;
    facultyId?: string;
    capacity?: number;
}

export interface AddScheduleDTO {
    day: number;
    startTime: string;
    endTime: string;
    room?: string;
}

export interface SectionWithDetails {
    id: string;
    code: string;
    capacity: number;
    enrolledCount: number;
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
    faculty: {
        id: string;
        nameEn: string;
        nameAr: string;
    };
    schedules: {
        id: string;
        day: number;
        startTime: string;
        endTime: string;
        room: string | null;
    }[];
    createdAt: Date;
}
