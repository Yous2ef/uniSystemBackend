import prisma from "../../config/database";
import { hash } from "bcrypt";
import {
    CreateStudentDTO,
    UpdateStudentDTO,
    StudentProfileResponse,
    StudentImportRow,
} from "./students.types";
import { Prisma } from "@prisma/client";

export class StudentsService {
    /**
     * Get all students with pagination and filters
     */
    async getAllStudents(filters?: {
        batchId?: string;
        departmentId?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: Prisma.StudentWhereInput = {};

        if (filters?.batchId) {
            where.batchId = filters.batchId;
        }

        if (filters?.departmentId) {
            where.departmentId = filters.departmentId;
        }

        if (filters?.status) {
            where.status = filters.status as any;
        }

        if (filters?.search) {
            where.OR = [
                {
                    studentCode: {
                        contains: filters.search,
                        mode: "insensitive",
                    },
                },
                { nameEn: { contains: filters.search, mode: "insensitive" } },
                { nameAr: { contains: filters.search, mode: "insensitive" } },
                {
                    user: {
                        email: {
                            contains: filters.search,
                            mode: "insensitive",
                        },
                    },
                },
            ];
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                            status: true,
                        },
                    },
                    batch: {
                        include: {
                            curriculum: {
                                select: {
                                    id: true,
                                    name: true,
                                    totalCredits: true,
                                },
                            },
                        },
                    },
                    department: {
                        select: {
                            id: true,
                            code: true,
                            nameEn: true,
                            nameAr: true,
                        },
                    },
                    cumulativeGpa: {
                        select: {
                            cgpa: true,
                            totalCredits: true,
                            academicStanding: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.student.count({ where }),
        ]);

        return {
            data: students,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get student by ID with full profile
     */
    async getStudentById(id: string): Promise<StudentProfileResponse | null> {
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
                batch: {
                    include: {
                        curriculum: {
                            select: {
                                id: true,
                                name: true,
                                totalCredits: true,
                            },
                        },
                    },
                },
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
            },
        });

        if (!student) {
            return null;
        }

        // Get academic standing
        const academicStanding = await this.getAcademicStanding(id);

        return {
            id: student.id,
            studentCode: student.studentCode,
            nameEn: student.nameEn,
            nameAr: student.nameAr,
            email: student.user.email,
            phone: student.phone,
            nationalId: student.nationalId,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            admissionDate: student.admissionDate,
            status: student.status,
            batch: {
                id: student.batch.id,
                name: student.batch.name,
                year: student.batch.year,
                curriculum: student.batch.curriculum,
            },
            department: student.department || undefined,
            academicStanding,
        };
    }

    /**
     * Get student by user ID with full profile
     */
    async getStudentByUserId(
        userId: string
    ): Promise<StudentProfileResponse | null> {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
                batch: {
                    include: {
                        curriculum: {
                            select: {
                                id: true,
                                name: true,
                                totalCredits: true,
                            },
                        },
                    },
                },
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                cumulativeGpa: true,
            },
        });

        if (!student) {
            return null;
        }

        // Get academic standing
        const academicStanding = await this.getAcademicStanding(student.id);

        return {
            id: student.id,
            studentCode: student.studentCode,
            nameEn: student.nameEn,
            nameAr: student.nameAr,
            email: student.user.email,
            phone: student.phone,
            nationalId: student.nationalId,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            admissionDate: student.admissionDate,
            status: student.status,
            batch: {
                id: student.batch.id,
                name: student.batch.name,
                year: student.batch.year,
                maxCredits: student.batch.maxCredits,
                minCredits: student.batch.minCredits,
                curriculum: student.batch.curriculum,
            },
            department: student.department || undefined,
            academicStanding,
            cumulativeGpa: student.cumulativeGpa || undefined,
        };
    }

    /**
     * Create new student
     */
    async createStudent(data: CreateStudentDTO) {
        // Check if student code already exists
        const existingStudent = await prisma.student.findUnique({
            where: { studentCode: data.studentCode },
        });

        if (existingStudent) {
            throw new Error("Student code already exists");
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Check if batch exists
        const batch = await prisma.batch.findUnique({
            where: { id: data.batchId },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        // Hash password
        const hashedPassword = await hash(data.password, 10);

        // Create user and student in transaction
        const student = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    role: "STUDENT",
                    status: "ACTIVE",
                },
            });

            // Create student
            const newStudent = await tx.student.create({
                data: {
                    userId: user.id,
                    studentCode: data.studentCode,
                    nameEn: data.nameEn,
                    nameAr: data.nameAr,
                    phone: data.phone,
                    nationalId: data.nationalId,
                    dateOfBirth: data.dateOfBirth
                        ? new Date(data.dateOfBirth)
                        : undefined,
                    gender: data.gender,
                    batchId: data.batchId,
                    departmentId: data.departmentId,
                    admissionDate: new Date(data.admissionDate),
                    status: data.status || "ACTIVE",
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            status: true,
                        },
                    },
                    batch: true,
                    department: true,
                },
            });

            return newStudent;
        });

        return student;
    }

    /**
     * Update student
     */
    async updateStudent(id: string, data: UpdateStudentDTO) {
        const student = await prisma.student.findUnique({
            where: { id },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        const updated = await prisma.student.update({
            where: { id },
            data: {
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                phone: data.phone,
                nationalId: data.nationalId,
                dateOfBirth: data.dateOfBirth
                    ? new Date(data.dateOfBirth)
                    : undefined,
                gender: data.gender,
                departmentId: data.departmentId,
                status: data.status,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
                batch: true,
                department: true,
            },
        });

        return updated;
    }

    /**
     * Delete student (soft delete)
     */
    async deleteStudent(id: string) {
        const student = await prisma.student.findUnique({
            where: { id },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        // Soft delete by setting status to DISMISSED
        await prisma.student.update({
            where: { id },
            data: { status: "DISMISSED" },
        });

        return { message: "Student deleted successfully" };
    }

    /**
     * Assign department to student
     */
    async assignDepartment(studentId: string, departmentId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        const department = await prisma.department.findUnique({
            where: { id: departmentId },
        });

        if (!department) {
            throw new Error("Department not found");
        }

        // Update student
        const updated = await prisma.student.update({
            where: { id: studentId },
            data: { departmentId },
            include: {
                department: true,
            },
        });

        return updated;
    }

    /**
     * Get students by batch
     */
    async getStudentsByBatch(batchId: string) {
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        const students = await prisma.student.findMany({
            where: { batchId },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
                department: {
                    select: {
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
            },
            orderBy: { studentCode: "asc" },
        });

        return students;
    }

    /**
     * Import students from CSV
     */
    async importStudents(batchId: string, students: StudentImportRow[]) {
        const batch = await prisma.batch.findUnique({
            where: { id: batchId },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as {
                row: number;
                error: string;
                data: StudentImportRow;
            }[],
        };

        for (let i = 0; i < students.length; i++) {
            const studentData = students[i];

            try {
                // Generate default password (can be changed later)
                const defaultPassword = `Student@${studentData.studentCode}`;

                await this.createStudent({
                    email: studentData.email,
                    password: defaultPassword,
                    studentCode: studentData.studentCode,
                    nameEn: studentData.nameEn,
                    nameAr: studentData.nameAr,
                    phone: studentData.phone,
                    nationalId: studentData.nationalId,
                    dateOfBirth: studentData.dateOfBirth
                        ? new Date(studentData.dateOfBirth)
                        : undefined,
                    gender: studentData.gender,
                    batchId,
                    admissionDate: new Date(),
                    status: "ACTIVE",
                });

                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    row: i + 1,
                    error: error.message,
                    data: studentData,
                });
            }
        }

        return results;
    }

    /**
     * Get academic standing for a student
     */
    private async getAcademicStanding(studentId: string) {
        const cumulativeGPA = await prisma.cumulativeGPA.findUnique({
            where: { studentId },
            select: {
                cgpa: true,
                totalCredits: true,
                academicStanding: true,
            },
        });

        if (!cumulativeGPA) {
            return {
                cgpa: 0.0,
                totalCredits: 0,
                standing: "NOT_CALCULATED",
            };
        }

        return {
            cgpa: cumulativeGPA.cgpa,
            totalCredits: cumulativeGPA.totalCredits,
            standing: cumulativeGPA.academicStanding,
        };
    }
}

export default new StudentsService();
