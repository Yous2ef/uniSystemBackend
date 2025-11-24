import prisma from "../../config/database";
import {
    EnrollStudentDTO,
    EnrollmentWithDetails,
    EnrollmentValidationResult,
} from "./enrollments.types";

export class EnrollmentsService {
    async getAllEnrollments(filters?: {
        studentId?: string;
        sectionId?: string;
        termId?: string;
        status?: "ENROLLED" | "DROPPED" | "WITHDRAWN" | "COMPLETED";
    }): Promise<EnrollmentWithDetails[]> {
        const where: any = {};

        if (filters?.studentId) where.studentId = filters.studentId;
        if (filters?.sectionId) where.sectionId = filters.sectionId;
        if (filters?.status) where.status = filters.status;

        if (filters?.termId) {
            where.section = { termId: filters.termId };
        }

        const enrollments = await prisma.enrollment.findMany({
            where,
            include: {
                student: {
                    include: {
                        user: { select: { email: true } },
                        batch: { select: { name: true } },
                        department: { select: { nameAr: true, nameEn: true } },
                    },
                },
                section: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                nameEn: true,
                                nameAr: true,
                                credits: true,
                            },
                        },
                        term: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                status: true,
                            },
                        },
                        faculty: {
                            select: {
                                id: true,
                                nameAr: true,
                                nameEn: true,
                            },
                        },
                        schedules: {
                            select: {
                                id: true,
                                day: true,
                                startTime: true,
                                endTime: true,
                                room: true,
                            },
                        },
                    },
                },
            },
            orderBy: { enrolledAt: "desc" },
        });

        return enrollments.map((e) => ({
            id: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            droppedAt: e.droppedAt,
            student: {
                id: e.student.id,
                studentCode: e.student.studentCode,
                nameAr: e.student.nameAr,
                nameEn: e.student.nameEn,
                email: e.student.user.email,
                phone: e.student.phone,
                batch: e.student.batch,
                department: e.student.department,
            },
            section: {
                id: e.section.id,
                sectionCode: e.section.code,
                capacity: e.section.capacity,
                course: e.section.course,
                term: e.section.term,
                faculty: e.section.faculty,
                schedules: e.section.schedules,
            },
            createdAt: e.createdAt,
        }));
    }

    async getEnrollmentsByUserId(
        userId: string,
        filters?: {
            sectionId?: string;
            termId?: string;
            status?: "ENROLLED" | "DROPPED" | "WITHDRAWN" | "COMPLETED";
        }
    ): Promise<EnrollmentWithDetails[]> {
        // First get student by userId
        const student = await prisma.student.findFirst({
            where: { userId },
        });

        if (!student) {
            return [];
        }

        // Then get enrollments for this student
        return this.getAllEnrollments({
            ...filters,
            studentId: student.id,
        });
    }

    async getEnrollmentById(id: string): Promise<EnrollmentWithDetails | null> {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        user: { select: { email: true } },
                        batch: { select: { name: true } },
                    },
                },
                section: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                nameEn: true,
                                nameAr: true,
                                credits: true,
                            },
                        },
                        term: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        });

        if (!enrollment) return null;

        return {
            id: enrollment.id,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            droppedAt: enrollment.droppedAt,
            student: {
                id: enrollment.student.id,
                studentCode: enrollment.student.studentCode,
                user: enrollment.student.user,
                batch: enrollment.student.batch,
            },
            section: {
                id: enrollment.section.id,
                code: enrollment.section.code,
                capacity: enrollment.section.capacity,
                course: enrollment.section.course,
                term: enrollment.section.term,
            },
            createdAt: enrollment.createdAt,
        };
    }

    async validateEnrollment(
        studentId: string,
        sectionId: string,
        skipTimeCheck: boolean = false
    ): Promise<EnrollmentValidationResult> {
        const errors: string[] = [];

        // Get student with batch and department info
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                batch: true,
                department: true,
                enrollments: {
                    where: { status: "ENROLLED" },
                    include: {
                        section: {
                            include: {
                                course: true,
                                term: true,
                                schedules: true,
                            },
                        },
                    },
                },
            },
        });

        if (!student) {
            errors.push("Student not found");
            return { valid: false, errors };
        }

        if (student.status !== "ACTIVE") {
            errors.push("Student is not active");
        }

        // Get section with full details
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                course: {
                    include: {
                        prerequisites: {
                            include: {
                                prerequisite: true,
                            },
                        },
                    },
                },
                term: true,
                schedules: true,
                enrollments: {
                    where: { status: "ENROLLED" },
                },
            },
        });

        if (!section) {
            errors.push("Section not found");
            return { valid: false, errors };
        }

        // Check department eligibility
        // If course has departmentId (not null), student must be in that department
        if (section.course.departmentId) {
            if (!student.departmentId) {
                errors.push(
                    "You must have a department assigned to register for department-specific courses"
                );
            } else if (student.departmentId !== section.course.departmentId) {
                errors.push(
                    "This course is only available for students in the " +
                        (student.department?.nameEn || "assigned") +
                        " department"
                );
            }
        }
        // If course.departmentId is null, it's a general course available to all

        // Check if already enrolled in this section
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                studentId,
                sectionId,
                status: { in: ["ENROLLED", "COMPLETED"] },
            },
        });

        if (existingEnrollment) {
            errors.push("Already enrolled in this section");
        }

        // Check registration period (skip for admin override)
        if (!skipTimeCheck) {
            const now = new Date();
            if (now < section.term.registrationStart) {
                errors.push("Registration has not started yet");
            }
            if (now > section.term.registrationEnd) {
                errors.push("Registration period has ended");
            }
        }

        // Check section capacity
        if (section.enrollments.length >= section.capacity) {
            errors.push("Section is full");
        }

        // Check credit limits
        const currentTermEnrollments = student.enrollments.filter(
            (e) =>
                e.section.term.id === section.term.id && e.status === "ENROLLED"
        );

        console.log("🔍 Schedule Conflict Check:");
        console.log("  Total student enrollments:", student.enrollments.length);
        console.log(
            "  Current term enrollments:",
            currentTermEnrollments.length
        );
        console.log("  Section term:", section.term.name, section.term.id);
        console.log(
            "  Current term enrollment courses:",
            currentTermEnrollments.map((e) => e.section.course.code)
        );

        const currentCredits = currentTermEnrollments.reduce(
            (sum, e) => sum + (e.section.course.credits || 0),
            0
        );
        const newTotalCredits = currentCredits + (section.course.credits || 0);

        if (newTotalCredits > student.batch.maxCredits) {
            errors.push(
                `Exceeds maximum credits (${student.batch.maxCredits})`
            );
        }

        // Check prerequisites
        for (const prereq of section.course.prerequisites) {
            if (prereq.type === "PREREQUISITE") {
                const completedPrereq = await prisma.enrollment.findFirst({
                    where: {
                        studentId,
                        section: {
                            courseId: prereq.prerequisiteId,
                        },
                        status: "COMPLETED",
                    },
                });

                if (!completedPrereq) {
                    errors.push(
                        `Missing prerequisite: ${prereq.prerequisite.code} - ${prereq.prerequisite.nameEn}`
                    );
                }
            }
        }

        // Check schedule conflicts
        for (const enrollment of currentTermEnrollments) {
            for (const schedule of section.schedules) {
                for (const existingSchedule of enrollment.section.schedules) {
                    if (schedule.day === existingSchedule.day) {
                        const newStart = schedule.startTime;
                        const newEnd = schedule.endTime;
                        const existingStart = existingSchedule.startTime;
                        const existingEnd = existingSchedule.endTime;

                        if (
                            (newStart < existingEnd &&
                                newEnd > existingStart) ||
                            (existingStart < newEnd && existingEnd > newStart)
                        ) {
                            errors.push(
                                `Schedule conflict with ${enrollment.section.course.code} on day ${schedule.day}`
                            );
                        }
                    }
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    async enrollStudent(data: EnrollStudentDTO) {
        // Validate enrollment (skip time check if admin bypass)
        const validation = await this.validateEnrollment(
            data.studentId,
            data.sectionId,
            data.bypassValidation || false
        );

        if (!validation.valid) {
            throw new Error(
                `Enrollment validation failed: ${validation.errors.join(", ")}`
            );
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                studentId: data.studentId,
                sectionId: data.sectionId,
                status: "ENROLLED",
            },
            include: {
                student: {
                    include: {
                        user: { select: { email: true } },
                        batch: { select: { name: true } },
                    },
                },
                section: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                nameEn: true,
                                nameAr: true,
                                credits: true,
                            },
                        },
                        term: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                    },
                },
            },
        });

        return enrollment;
    }

    async dropEnrollment(id: string, bypassTimeCheck: boolean = false) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                section: {
                    include: {
                        term: true,
                    },
                },
            },
        });

        if (!enrollment) {
            throw new Error("Enrollment not found");
        }

        if (enrollment.status !== "ENROLLED") {
            throw new Error("Can only drop enrolled courses");
        }

        // Check if within drop period (skip for admin)
        if (!bypassTimeCheck) {
            const now = new Date();
            if (now > enrollment.section.term.registrationEnd) {
                throw new Error("Drop period has ended");
            }
        }

        const updated = await prisma.enrollment.update({
            where: { id },
            data: {
                status: "DROPPED",
                droppedAt: new Date(),
            },
        });

        return updated;
    }

    async getStudentSchedule(studentId: string, termId: string) {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
                status: "ENROLLED",
                section: {
                    termId,
                },
            },
            include: {
                section: {
                    include: {
                        course: true,
                        faculty: {
                            select: {
                                nameEn: true,
                                nameAr: true,
                            },
                        },
                        schedules: {
                            orderBy: [{ day: "asc" }, { startTime: "asc" }],
                        },
                    },
                },
            },
            orderBy: {
                section: {
                    course: {
                        code: "asc",
                    },
                },
            },
        });

        return enrollments.map((e) => ({
            enrollmentId: e.id,
            course: e.section.course,
            section: {
                id: e.section.id,
                code: e.section.code,
                capacity: e.section.capacity,
            },
            faculty: e.section.faculty,
            schedules: e.section.schedules,
        }));
    }

    async getEnrollmentsBySection(sectionId: string) {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                sectionId,
                status: "ENROLLED",
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                        department: {
                            select: {
                                nameAr: true,
                                nameEn: true,
                            },
                        },
                        batch: {
                            select: {
                                year: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                student: {
                    studentCode: "asc",
                },
            },
        });

        return enrollments;
    }
}

export default new EnrollmentsService();
