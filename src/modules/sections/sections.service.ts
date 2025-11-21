import prisma from "../../config/database";
import {
    CreateSectionDTO,
    UpdateSectionDTO,
    AddScheduleDTO,
    SectionWithDetails,
} from "./sections.types";

export class SectionsService {
    async getAllSections(filters?: {
        termId?: string;
        courseId?: string;
        facultyId?: string;
    }): Promise<SectionWithDetails[]> {
        const where: any = {};
        if (filters?.termId) where.termId = filters.termId;
        if (filters?.courseId) where.courseId = filters.courseId;
        if (filters?.facultyId) where.facultyId = filters.facultyId;

        const sections = await prisma.section.findMany({
            where,
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
                term: { select: { id: true, name: true, type: true } },
                faculty: { select: { id: true, nameEn: true, nameAr: true } },
                schedules: {
                    select: {
                        id: true,
                        day: true,
                        startTime: true,
                        endTime: true,
                        room: true,
                    },
                },
                enrollments: { select: { id: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return sections.map((s) => ({
            id: s.id,
            code: s.code,
            capacity: s.capacity,
            enrolledCount: s.enrollments.length,
            course: s.course,
            term: s.term,
            faculty: s.faculty,
            schedules: s.schedules,
            createdAt: s.createdAt,
        }));
    }

    async getSectionById(id: string): Promise<SectionWithDetails | null> {
        const section = await prisma.section.findUnique({
            where: { id },
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
                term: { select: { id: true, name: true, type: true } },
                faculty: { select: { id: true, nameEn: true, nameAr: true } },
                schedules: {
                    select: {
                        id: true,
                        day: true,
                        startTime: true,
                        endTime: true,
                        room: true,
                    },
                },
                enrollments: { select: { id: true } },
            },
        });

        if (!section) return null;

        return {
            id: section.id,
            code: section.code,
            capacity: section.capacity,
            enrolledCount: section.enrollments.length,
            course: section.course,
            term: section.term,
            faculty: section.faculty,
            schedules: section.schedules,
            createdAt: section.createdAt,
        };
    }

    async createSection(data: CreateSectionDTO) {
        const existing = await prisma.section.findFirst({
            where: {
                courseId: data.courseId,
                termId: data.termId,
                code: data.code,
            },
        });

        if (existing) {
            throw new Error(
                "Section with this code already exists for this course and term"
            );
        }

        const section = await prisma.section.create({
            data: {
                courseId: data.courseId,
                termId: data.termId,
                code: data.code,
                facultyId: data.facultyId,
                capacity: data.capacity,
                schedules: data.schedules
                    ? {
                          create: data.schedules,
                      }
                    : undefined,
            },
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
                term: { select: { id: true, name: true, type: true } },
                faculty: { select: { id: true, nameEn: true, nameAr: true } },
                schedules: true,
            },
        });

        return section;
    }

    async updateSection(id: string, data: UpdateSectionDTO) {
        const existing = await prisma.section.findUnique({ where: { id } });
        if (!existing) return null;

        const updated = await prisma.section.update({
            where: { id },
            data: {
                code: data.code,
                facultyId: data.facultyId,
                capacity: data.capacity,
            },
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
                term: { select: { id: true, name: true, type: true } },
                faculty: { select: { id: true, nameEn: true, nameAr: true } },
                schedules: true,
            },
        });

        return updated;
    }

    async deleteSection(id: string) {
        const section = await prisma.section.findUnique({
            where: { id },
            include: { enrollments: { select: { id: true } } },
        });

        if (!section) throw new Error("Section not found");
        if (section.enrollments.length > 0) {
            throw new Error("Cannot delete section with enrolled students");
        }

        await prisma.section.delete({ where: { id } });
        return { message: "Section deleted successfully" };
    }

    async addSchedule(sectionId: string, data: AddScheduleDTO) {
        const section = await prisma.section.findUnique({
            where: { id: sectionId },
        });
        if (!section) throw new Error("Section not found");

        const schedule = await prisma.schedule.create({
            data: {
                sectionId,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
            },
        });

        return schedule;
    }

    async deleteSchedule(sectionId: string, scheduleId: string) {
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
        });

        if (!schedule || schedule.sectionId !== sectionId) {
            throw new Error("Schedule not found");
        }

        await prisma.schedule.delete({ where: { id: scheduleId } });
        return { message: "Schedule deleted successfully" };
    }
}

export default new SectionsService();
