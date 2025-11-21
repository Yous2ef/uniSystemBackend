import { Request, Response, NextFunction } from "express";
import studentsService from "./students.service";
import { CreateStudentDTO, StudentImportRow } from "./students.types";

export class StudentsController {
    /**
     * Get all students
     */
    async getAllStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                batchId: req.query.batchId as string,
                specializationId: req.query.specializationId as string,
                status: req.query.status as string,
                search: req.query.search as string,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 20,
            };

            const result = await studentsService.getAllStudents(filters);

            res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get student by ID
     */
    async getStudentById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const student = await studentsService.getStudentById(id);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found",
                });
            }

            res.status(200).json({
                success: true,
                data: student,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get student by user ID
     */
    async getStudentByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const student = await studentsService.getStudentByUserId(userId);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found",
                });
            }

            res.status(200).json({
                success: true,
                data: student,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new student
     */
    async createStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const data: CreateStudentDTO = req.body;

            const student = await studentsService.createStudent(data);

            res.status(201).json({
                success: true,
                message: "Student created successfully",
                data: student,
            });
        } catch (error: any) {
            if (
                error.message === "Student code already exists" ||
                error.message === "Email already exists"
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * Update student
     */
    async updateStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = req.body;

            const student = await studentsService.updateStudent(id, data);

            res.status(200).json({
                success: true,
                message: "Student updated successfully",
                data: student,
            });
        } catch (error: any) {
            if (error.message === "Student not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * Delete student
     */
    async deleteStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await studentsService.deleteStudent(id);

            res.status(200).json({
                success: true,
                message: "Student deleted successfully",
            });
        } catch (error: any) {
            if (error.message === "Student not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * Assign department
     */
    async assignDepartment(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { departmentId } = req.body;

            const student = await studentsService.assignDepartment(
                id,
                departmentId
            );

            res.status(200).json({
                success: true,
                message: "Department assigned successfully",
                data: student,
            });
        } catch (error: any) {
            if (
                error.message === "Student not found" ||
                error.message === "Department not found"
            ) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * Get students by batch
     */
    async getStudentsByBatch(req: Request, res: Response, next: NextFunction) {
        try {
            const { batchId } = req.params;

            const students = await studentsService.getStudentsByBatch(batchId);

            res.status(200).json({
                success: true,
                data: students,
            });
        } catch (error: any) {
            if (error.message === "Batch not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * Import students from CSV
     */
    async importStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const { batchId } = req.body;
            const file = (req as any).file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            // Parse CSV (simplified - in production use csv-parser library)
            const csvData = file.buffer.toString("utf-8");
            const lines = csvData.split("\n");
            const students: StudentImportRow[] = [];

            // Skip header row
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const [
                    studentCode,
                    nameEn,
                    nameAr,
                    email,
                    phone,
                    nationalId,
                    dateOfBirth,
                    gender,
                ] = line.split(",");

                students.push({
                    studentCode: studentCode.trim(),
                    nameEn: nameEn.trim(),
                    nameAr: nameAr.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    nationalId: nationalId.trim(),
                    dateOfBirth: dateOfBirth.trim(),
                    gender: gender.trim() as "MALE" | "FEMALE",
                });
            }

            const result = await studentsService.importStudents(
                batchId,
                students
            );

            res.status(200).json({
                success: true,
                message: `Import completed: ${result.success} successful, ${result.failed} failed`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current student profile
     */
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore - userId is added by auth middleware
            const userId = req.user?.userId;
            console.log("[getProfile] userId from token:", userId);
            if (!userId) {
                console.log("[getProfile] No userId found in token");
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const student = await studentsService.getStudentByUserId(userId);
            console.log("[getProfile] student from DB:", student);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found",
                });
            }

            res.status(200).json({
                success: true,
                data: student,
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new StudentsController();
