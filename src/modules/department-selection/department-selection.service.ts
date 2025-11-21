import prisma from "../../config/database";
import {
    DepartmentEligibility,
    StudentEligibilityStatus,
    ApplyDepartmentDTO,
    ProcessApplicationDTO,
    DepartmentApplicationResponse,
} from "./department-selection.types";

export class DepartmentSelectionService {
    /**
     * Get available departments with eligibility status for a student
     */
    async getAvailableDepartments(
        userId: string
    ): Promise<DepartmentEligibility[]> {
        // Get student data
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                cumulativeGpa: true,
                batch: true,
                departmentApplication: true,
            },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        // Get all departments
        const departments = await prisma.department.findMany({
            include: {
                college: true,
                students: {
                    where: { status: "ACTIVE" },
                },
            },
        });

        // Calculate student's current year based on enrollments
        const completedTerms = await prisma.termGPA.count({
            where: { studentId: student.id },
        });
        const currentYear = Math.floor(completedTerms / 2) + 1; // 2 terms per year

        const eligibilityList: DepartmentEligibility[] = [];

        for (const dept of departments) {
            const enrolledCount = dept.students.length;
            const availableSeats = dept.capacity - enrolledCount;
            const studentGpa = student.cumulativeGpa?.cgpa || 0;

            const eligibilityReasons = {
                hasMinimumGPA: studentGpa >= dept.minGpa,
                hasAvailableSeats: availableSeats > 0,
                isCorrectYear: currentYear >= dept.selectionYear,
                hasNoExistingDepartment: !student.departmentId,
                hasNoPendingApplication:
                    !student.departmentApplication ||
                    student.departmentApplication.status !== "PENDING",
                isGoodAcademicStanding:
                    student.cumulativeGpa?.academicStanding ===
                        "GOOD_STANDING" ||
                    student.cumulativeGpa?.academicStanding ===
                        "ACADEMIC_WARNING",
            };

            const isEligible = Object.values(eligibilityReasons).every(
                (v) => v === true
            );

            eligibilityList.push({
                departmentId: dept.id,
                departmentCode: dept.code,
                departmentNameAr: dept.nameAr,
                departmentNameEn: dept.nameEn,
                collegeNameAr: dept.college.nameAr,
                minGpa: dept.minGpa,
                capacity: dept.capacity,
                enrolledCount,
                availableSeats,
                isEligible,
                eligibilityReasons,
            });
        }

        return eligibilityList;
    }

    /**
     * Get student's eligibility status
     */
    async getStudentEligibility(
        userId: string
    ): Promise<StudentEligibilityStatus> {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                cumulativeGpa: true,
                departmentApplication: true,
            },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        const completedTerms = await prisma.termGPA.count({
            where: { studentId: student.id },
        });
        const currentYear = Math.floor(completedTerms / 2) + 1;

        const studentGpa = student.cumulativeGpa?.cgpa || 0;
        const hasDepartment = !!student.departmentId;
        const hasPendingApplication =
            student.departmentApplication?.status === "PENDING";
        const academicStanding =
            student.cumulativeGpa?.academicStanding || "GOOD_STANDING";

        const reasons: string[] = [];
        if (hasDepartment) reasons.push("لديك قسم معين بالفعل");
        if (hasPendingApplication) reasons.push("لديك طلب قيد المراجعة");
        if (studentGpa === 0) reasons.push("لا يوجد معدل تراكمي محسوب");
        if (
            academicStanding === "ACADEMIC_PROBATION" ||
            academicStanding === "ACADEMIC_DISMISSAL"
        ) {
            reasons.push("وضعك الأكاديمي لا يسمح بالتقديم");
        }

        const canApply =
            !hasDepartment &&
            !hasPendingApplication &&
            studentGpa > 0 &&
            (academicStanding === "GOOD_STANDING" ||
                academicStanding === "ACADEMIC_WARNING");

        return {
            canApply,
            studentGpa,
            currentYear,
            hasDepartment,
            hasPendingApplication,
            academicStanding,
            reasons,
        };
    }

    /**
     * Get student's current application
     */
    async getMyApplication(userId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                departmentApplication: {
                    include: {
                        department: true,
                    },
                },
            },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        if (!student.departmentApplication) {
            return null;
        }

        const app = student.departmentApplication;
        return {
            id: app.id,
            departmentId: app.departmentId,
            departmentNameAr: app.department.nameAr,
            departmentCode: app.department.code,
            status: app.status,
            studentGpa: app.studentGpa,
            statement: app.statement,
            submittedAt: app.submittedAt.toISOString(),
            processedAt: app.processedAt?.toISOString(),
            rejectionReason: app.rejectionReason,
        };
    }

    /**
     * Apply to a department
     */
    async applyToDepartment(userId: string, dto: ApplyDepartmentDTO) {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                cumulativeGpa: true,
                departmentApplication: true,
            },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        // Check if student already has a department
        if (student.departmentId) {
            throw new Error("لديك قسم معين بالفعل");
        }

        // Check if student has pending application
        if (
            student.departmentApplication &&
            student.departmentApplication.status === "PENDING"
        ) {
            throw new Error("لديك طلب قيد المراجعة بالفعل");
        }

        // Get department
        const department = await prisma.department.findUnique({
            where: { id: dto.departmentId },
            include: {
                students: {
                    where: { status: "ACTIVE" },
                },
            },
        });

        if (!department) {
            throw new Error("القسم غير موجود");
        }

        // Check available seats
        const enrolledCount = department.students.length;
        const availableSeats = department.capacity - enrolledCount;
        if (availableSeats <= 0) {
            throw new Error("لا توجد مقاعد متاحة في هذا القسم");
        }

        // Check GPA requirement
        const studentGpa = student.cumulativeGpa?.cgpa || 0;
        if (studentGpa < department.minGpa) {
            throw new Error(
                `المعدل التراكمي المطلوب: ${department.minGpa}. معدلك الحالي: ${studentGpa}`
            );
        }

        // Check academic standing
        const academicStanding = student.cumulativeGpa?.academicStanding;
        if (
            academicStanding === "ACADEMIC_PROBATION" ||
            academicStanding === "ACADEMIC_DISMISSAL"
        ) {
            throw new Error("وضعك الأكاديمي لا يسمح بالتقديم");
        }

        // Create or update application
        const application = await prisma.departmentApplication.upsert({
            where: { studentId: student.id },
            create: {
                studentId: student.id,
                departmentId: dto.departmentId,
                studentGpa,
                statement: dto.statement,
                status: "PENDING",
            },
            update: {
                departmentId: dto.departmentId,
                studentGpa,
                statement: dto.statement,
                status: "PENDING",
                processedAt: null,
                processedBy: null,
                rejectionReason: null,
            },
            include: {
                department: true,
            },
        });

        return {
            id: application.id,
            departmentId: application.departmentId,
            departmentNameAr: application.department.nameAr,
            status: application.status,
            submittedAt: application.submittedAt.toISOString(),
        };
    }

    /**
     * Withdraw application
     */
    async withdrawApplication(userId: string, applicationId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        const application = await prisma.departmentApplication.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new Error("الطلب غير موجود");
        }

        if (application.studentId !== student.id) {
            throw new Error("غير مصرح لك بهذا الإجراء");
        }

        if (application.status !== "PENDING") {
            throw new Error("لا يمكن سحب طلب تمت معالجته");
        }

        await prisma.departmentApplication.update({
            where: { id: applicationId },
            data: { status: "WITHDRAWN" },
        });

        return { message: "تم سحب الطلب بنجاح" };
    }

    /**
     * Get all applications (Admin)
     */
    async getAllApplications(filters?: {
        status?: string;
        departmentId?: string;
        batchId?: string;
    }): Promise<DepartmentApplicationResponse[]> {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.departmentId) {
            where.departmentId = filters.departmentId;
        }

        if (filters?.batchId) {
            where.student = {
                batchId: filters.batchId,
            };
        }

        const applications = await prisma.departmentApplication.findMany({
            where,
            include: {
                student: true,
                department: true,
            },
            orderBy: { submittedAt: "desc" },
        });

        return applications.map((app) => ({
            id: app.id,
            studentId: app.studentId,
            studentCode: app.student.studentCode,
            studentNameAr: app.student.nameAr,
            studentNameEn: app.student.nameEn,
            departmentId: app.departmentId,
            departmentNameAr: app.department.nameAr,
            departmentCode: app.department.code,
            status: app.status,
            studentGpa: app.studentGpa,
            statement: app.statement || undefined,
            submittedAt: app.submittedAt.toISOString(),
            processedAt: app.processedAt?.toISOString(),
            processedBy: app.processedBy || undefined,
            rejectionReason: app.rejectionReason || undefined,
        }));
    }

    /**
     * Process application (Admin)
     */
    async processApplication(
        applicationId: string,
        dto: ProcessApplicationDTO,
        adminUserId: string
    ) {
        const application = await prisma.departmentApplication.findUnique({
            where: { id: applicationId },
            include: {
                student: true,
                department: {
                    include: {
                        students: {
                            where: { status: "ACTIVE" },
                        },
                    },
                },
            },
        });

        if (!application) {
            throw new Error("الطلب غير موجود");
        }

        if (application.status !== "PENDING") {
            throw new Error("تمت معالجة هذا الطلب مسبقاً");
        }

        if (dto.status === "APPROVED") {
            // Check if department still has seats
            const enrolledCount = application.department.students.length;
            const availableSeats =
                application.department.capacity - enrolledCount;
            if (availableSeats <= 0) {
                throw new Error("لا توجد مقاعد متاحة في هذا القسم");
            }

            // Update student's department
            await prisma.student.update({
                where: { id: application.studentId },
                data: { departmentId: application.departmentId },
            });
        }

        // Update application
        const updated = await prisma.departmentApplication.update({
            where: { id: applicationId },
            data: {
                status: dto.status,
                processedAt: new Date(),
                processedBy: adminUserId,
                rejectionReason:
                    dto.status === "REJECTED" ? dto.rejectionReason : null,
            },
            include: {
                student: true,
                department: true,
            },
        });

        return {
            id: updated.id,
            studentNameAr: updated.student.nameAr,
            departmentNameAr: updated.department.nameAr,
            status: updated.status,
            processedAt: updated.processedAt?.toISOString(),
        };
    }

    /**
     * Get application statistics (Admin)
     */
    async getStatistics() {
        const total = await prisma.departmentApplication.count();
        const pending = await prisma.departmentApplication.count({
            where: { status: "PENDING" },
        });
        const approved = await prisma.departmentApplication.count({
            where: { status: "APPROVED" },
        });
        const rejected = await prisma.departmentApplication.count({
            where: { status: "REJECTED" },
        });

        const byDepartment = await prisma.departmentApplication.groupBy({
            by: ["departmentId", "status"],
            _count: true,
        });

        return {
            total,
            pending,
            approved,
            rejected,
            byDepartment,
        };
    }
}

export const departmentSelectionService = new DepartmentSelectionService();
