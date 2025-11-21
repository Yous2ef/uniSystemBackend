export interface CreateTermDTO {
    batchId: string;
    name: string;
    type: "FALL" | "SPRING" | "SUMMER";
    status?: "ACTIVE" | "INACTIVE" | "COMPLETED";
    startDate: Date;
    endDate: Date;
    registrationStart: Date;
    registrationEnd: Date;
}

export interface UpdateTermDTO {
    batchId?: string;
    name?: string;
    status?: "ACTIVE" | "INACTIVE" | "COMPLETED";
    startDate?: Date;
    endDate?: Date;
    registrationStart?: Date;
    registrationEnd?: Date;
}

export interface TermWithDetails {
    id: string;
    batchId: string;
    name: string;
    type: "FALL" | "SPRING" | "SUMMER";
    status: "ACTIVE" | "INACTIVE" | "COMPLETED";
    startDate: Date;
    endDate: Date;
    registrationStart: Date;
    registrationEnd: Date;
    sectionsCount: number;
    createdAt: Date;
}
