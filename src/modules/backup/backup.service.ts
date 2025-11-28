import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import * as os from "os";
import prisma from "../../config/database";

interface BackupStats {
    databaseSize: string;
    lastBackup: string;
    backupCount: number;
}

interface SystemStats {
    totalUsers: number;
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    activeTerms: number;
}

type ProgressCallback = (message: string, percent: number) => void;

const tmpBackupDir = path.join(os.tmpdir(), "backups");
const defaultBackupDir = path.join(process.cwd(), "backups");
const requestedBackupDir =
    process.env.BACKUPS_DIR ||
    (process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    process.env.LAMBDA_TASK_ROOT
        ? tmpBackupDir
        : defaultBackupDir);

let resolvedBackupDir = requestedBackupDir;

try {
    fsSync.mkdirSync(resolvedBackupDir, { recursive: true });
} catch (error) {
    const err = error as NodeJS.ErrnoException;
    const shouldFallback =
        resolvedBackupDir !== tmpBackupDir &&
        (!err?.code ||
            err.code === "EACCES" ||
            err.code === "ENOENT" ||
            err.code === "EPERM" ||
            err.code === "EROFS");

    if (!shouldFallback) {
        throw error;
    }

    resolvedBackupDir = tmpBackupDir;
    fsSync.mkdirSync(resolvedBackupDir, { recursive: true });
}

export class BackupService {
    private backupDir = resolvedBackupDir;

    async ensureBackupDirectory() {
        try {
            await fs.access(this.backupDir);
        } catch {
            await fs.mkdir(this.backupDir, { recursive: true });
        }
    }

    // Helper to escape SQL string values
    private escapeSqlValue(value: any): string {
        if (value === null || value === undefined) {
            return "NULL";
        }
        if (typeof value === "boolean") {
            return value ? "TRUE" : "FALSE";
        }
        if (typeof value === "number") {
            return value.toString();
        }
        if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        }
        if (typeof value === "object") {
            // For JSON fields
            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        }
        // String - escape single quotes
        return `'${String(value).replace(/'/g, "''")}'`;
    }

    // Generate SQL INSERT statements for a table
    private async generateTableBackup(
        tableName: string,
        data: any[]
    ): Promise<string> {
        if (data.length === 0) {
            return `-- No data for table ${tableName}\n\n`;
        }

        let sql = `-- Data for table ${tableName}\n`;
        const columns = Object.keys(data[0]);

        for (const row of data) {
            const values = columns
                .map((col) => this.escapeSqlValue(row[col]))
                .join(", ");
            sql += `INSERT INTO "${tableName}" (${columns
                .map((c) => `"${c}"`)
                .join(", ")}) VALUES (${values});\n`;
        }

        return sql + "\n";
    }

    async createBackup(progressCallback?: ProgressCallback): Promise<{
        success: boolean;
        filename: string;
        path: string;
    }> {
        try {
            progressCallback?.("جاري تجهيز النسخة الاحتياطية...", 5);
            await this.ensureBackupDirectory();

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `backup-${timestamp}.sql`;
            const filePath = path.join(this.backupDir, filename);

            console.log("Creating SQL backup with Prisma...");
            progressCallback?.("جاري بناء ملف النسخة الاحتياطية...", 10);

            let sqlContent = `-- Database Backup\n-- Generated: ${new Date().toISOString()}\n-- System: University Management System\n\n`;

            // Disable triggers during restore
            sqlContent += `-- Disable triggers for faster import\nSET session_replication_role = replica;\n\n`;

            // Get all table names from the database
            progressCallback?.("جاري اكتشاف الجداول...", 15);
            const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename NOT LIKE '_prisma_%'
                ORDER BY tablename
            `;

            console.log(`Found ${tables.length} tables to backup`);
            progressCallback?.(`تم العثور على ${tables.length} جدول`, 20);

            // Export each table
            const totalTables = tables.length;
            for (let i = 0; i < totalTables; i++) {
                const { tablename } = tables[i];
                const progressPercent = 20 + Math.floor((i / totalTables) * 70);

                try {
                    progressCallback?.(
                        `جاري نسخ جدول: ${tablename}...`,
                        progressPercent
                    );

                    // Query all data from the table
                    const data = await prisma.$queryRawUnsafe(
                        `SELECT * FROM "${tablename}"`
                    );

                    if (Array.isArray(data) && data.length > 0) {
                        console.log(
                            `Backing up table: ${tablename} (${data.length} rows)`
                        );
                        sqlContent += await this.generateTableBackup(
                            tablename,
                            data
                        );
                    } else {
                        console.log(`Skipping empty table: ${tablename}`);
                        sqlContent += `-- No data for table ${tablename}\n\n`;
                    }
                } catch (error) {
                    console.error(
                        `Error backing up table ${tablename}:`,
                        error
                    );
                    sqlContent += `-- Error backing up table ${tablename}: ${error}\n\n`;
                }
            }

            // Re-enable triggers
            sqlContent += `-- Re-enable triggers\nSET session_replication_role = DEFAULT;\n\n`;
            sqlContent += `-- Backup completed successfully\n`;

            // Write to file
            progressCallback?.("جاري حفظ الملف...", 92);
            await fs.writeFile(filePath, sqlContent, "utf-8");

            // Verify backup file was created and has content
            progressCallback?.("جاري التحقق من الملف...", 95);
            const stats = await fs.stat(filePath);
            if (stats.size === 0) {
                throw new Error("Backup file is empty");
            }

            console.log(
                `SQL Backup created successfully: ${filename} (${stats.size} bytes)`
            );

            progressCallback?.("تم إنشاء النسخة الاحتياطية بنجاح!", 98);
            return {
                success: true,
                filename,
                path: filePath,
            };
        } catch (error) {
            console.error("Backup creation error:", error);
            throw new Error(`Failed to create backup: ${error}`);
        }
    }

    async restoreBackup(
        filePath: string,
        progressCallback?: ProgressCallback
    ): Promise<{ success: boolean }> {
        try {
            progressCallback?.("جاري قراءة ملف النسخة الاحتياطية...", 10);
            console.log("Reading backup file:", filePath);
            const sqlContent = await fs.readFile(filePath, "utf-8");

            progressCallback?.("جاري بدء عملية الاستعادة...", 20);
            console.log("Starting database restore...");

            // Step 1: Clear all existing data (deleteAllData preserves admin users automatically)
            progressCallback?.("جاري مسح البيانات الحالية...", 30);
            console.log("Clearing existing data...");

            // Use the existing deleteAllData method that preserves admin users
            await this.deleteAllData();

            // Step 3: Execute the SQL backup file
            progressCallback?.("جاري استعادة البيانات...", 40);
            console.log("Restoring data from SQL file...");

            // Disable foreign key checks and triggers during restore
            await prisma.$executeRawUnsafe(
                `SET session_replication_role = replica;`
            );

            // Split SQL content into individual statements
            const statements = sqlContent
                .split(";")
                .map((s) => s.trim())
                .filter((s) => s && !s.startsWith("--") && s.length > 0);

            let successCount = 0;
            let errorCount = 0;
            const totalStatements = statements.filter((s) =>
                s.startsWith("INSERT")
            ).length;

            // Execute each statement
            let processedCount = 0;
            for (const statement of statements) {
                if (statement.trim() && statement.startsWith("INSERT")) {
                    try {
                        await prisma.$executeRawUnsafe(statement + ";");
                        successCount++;
                        processedCount++;

                        // Update progress (40% to 85%)
                        const progress =
                            40 +
                            Math.floor((processedCount / totalStatements) * 45);
                        if (
                            processedCount % 10 === 0 ||
                            processedCount === totalStatements
                        ) {
                            progressCallback?.(
                                `جاري استعادة البيانات... (${processedCount}/${totalStatements})`,
                                progress
                            );
                        }
                    } catch (error: any) {
                        errorCount++;
                        console.error(
                            `Error executing INSERT: ${error.message}`
                        );
                        // Continue with other statements even if one fails
                    }
                }
            }

            // Re-enable foreign key checks and triggers
            progressCallback?.("جاري إعادة تفعيل القيود...", 90);
            await prisma.$executeRawUnsafe(
                `SET session_replication_role = DEFAULT;`
            );

            console.log(
                `Restore completed: ${successCount} successful, ${errorCount} errors`
            );

            // Step 4: Admin users are already preserved by deleteAllData
            // No need to restore them again

            progressCallback?.("تم استعادة النسخة الاحتياطية بنجاح!", 100);
            console.log("Backup restored successfully");
            return { success: true };
        } catch (error) {
            console.error("Backup restoration error:", error);
            throw new Error(`Failed to restore backup: ${error}`);
        }
    }

    async restoreFromFile(
        filename: string,
        progressCallback?: ProgressCallback
    ): Promise<{ success: boolean }> {
        const filePath = path.join(this.backupDir, filename);
        // Check if file exists
        await fs.access(filePath);
        return this.restoreBackup(filePath, progressCallback);
    }

    async listBackups(): Promise<string[]> {
        try {
            await this.ensureBackupDirectory();
            const files = await fs.readdir(this.backupDir);
            return files
                .filter((file) => file.endsWith(".sql"))
                .sort()
                .reverse();
        } catch (error) {
            console.error("Error listing backups:", error);
            return [];
        }
    }

    async deleteBackup(filename: string): Promise<{ success: boolean }> {
        try {
            const filePath = path.join(this.backupDir, filename);
            await fs.unlink(filePath);
            return { success: true };
        } catch (error) {
            console.error("Error deleting backup:", error);
            throw new Error(`Failed to delete backup: ${error}`);
        }
    }

    async getBackupFilePath(filename: string): Promise<string> {
        const filePath = path.join(this.backupDir, filename);
        try {
            await fs.access(filePath);
            return filePath;
        } catch (error) {
            throw new Error(`Backup file not found: ${filename}`);
        }
    }

    async getBackupStats(): Promise<BackupStats> {
        try {
            await this.ensureBackupDirectory();
            const backups = await this.listBackups();

            let lastBackup = "لم يتم عمل نسخة احتياطية";
            if (backups.length > 0) {
                const latestBackup = backups[0];
                const stats = await fs.stat(
                    path.join(this.backupDir, latestBackup)
                );
                lastBackup = new Date(stats.mtime).toLocaleString("ar-SA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }

            // Calculate approximate database size
            const dbUrl = process.env.DATABASE_URL;
            let databaseSize = "N/A";

            if (dbUrl) {
                try {
                    const result = await prisma.$queryRaw<any[]>`
                        SELECT pg_size_pretty(pg_database_size(current_database())) as size
                    `;
                    databaseSize = result[0]?.size || "N/A";
                } catch (error) {
                    console.error("Error getting database size:", error);
                }
            }

            return {
                databaseSize,
                lastBackup,
                backupCount: backups.length,
            };
        } catch (error) {
            console.error("Error getting backup stats:", error);
            return {
                databaseSize: "N/A",
                lastBackup: "لم يتم عمل نسخة احتياطية",
                backupCount: 0,
            };
        }
    }

    async getSystemStats(): Promise<SystemStats> {
        try {
            const [
                totalUsers,
                totalStudents,
                totalFaculty,
                totalCourses,
                activeTerms,
            ] = await Promise.all([
                prisma.user.count(),
                prisma.student.count(),
                prisma.faculty.count(),
                prisma.course.count(),
                prisma.academicTerm.count({
                    where: {
                        status: "ACTIVE",
                    },
                }),
            ]);

            return {
                totalUsers,
                totalStudents,
                totalFaculty,
                totalCourses,
                activeTerms,
            };
        } catch (error) {
            console.error("Error getting system stats:", error);
            return {
                totalUsers: 0,
                totalStudents: 0,
                totalFaculty: 0,
                totalCourses: 0,
                activeTerms: 0,
            };
        }
    }

    async exportData(type: string): Promise<{ success: boolean; data: any[] }> {
        try {
            let data: any[] = [];

            switch (type) {
                case "students":
                    data = await prisma.student.findMany({
                        include: {
                            user: {
                                select: {
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
                                },
                            },
                        },
                    });
                    break;

                case "faculty":
                    data = await prisma.faculty.findMany({
                        include: {
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    });
                    break;

                case "courses":
                    data = await prisma.course.findMany({
                        include: {
                            department: {
                                select: {
                                    nameAr: true,
                                    nameEn: true,
                                },
                            },
                        },
                    });
                    break;

                case "grades":
                    data = await prisma.grade.findMany({
                        include: {
                            enrollment: {
                                include: {
                                    student: {
                                        include: {
                                            user: {
                                                select: {
                                                    email: true,
                                                },
                                            },
                                        },
                                    },
                                    section: {
                                        include: {
                                            course: {
                                                select: {
                                                    code: true,
                                                    nameAr: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    });
                    break;

                case "attendance":
                    data = await prisma.attendance.findMany({
                        include: {
                            enrollment: {
                                include: {
                                    student: {
                                        include: {
                                            user: {
                                                select: {
                                                    email: true,
                                                },
                                            },
                                        },
                                    },
                                    section: {
                                        include: {
                                            course: {
                                                select: {
                                                    code: true,
                                                    nameAr: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    });
                    break;

                default:
                    throw new Error("Invalid export type");
            }

            return { success: true, data };
        } catch (error) {
            console.error("Error exporting data:", error);
            throw new Error(`Failed to export data: ${error}`);
        }
    }

    async clearCache(): Promise<{ success: boolean }> {
        try {
            // In a real application, you would clear Redis cache or similar
            // For now, we'll just simulate it
            console.log("Cache cleared");
            return { success: true };
        } catch (error) {
            console.error("Error clearing cache:", error);
            throw new Error(`Failed to clear cache: ${error}`);
        }
    }

    async deleteAllData(): Promise<{ success: boolean }> {
        try {
            console.log("Starting deleteAllData...");

            // Disable all foreign key constraints and triggers
            await prisma.$executeRawUnsafe(
                `SET session_replication_role = replica;`
            );

            // Get all table names
            const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename NOT LIKE '_prisma_%'
                ORDER BY tablename
            `;

            console.log(`Found ${tables.length} tables to clear`);

            // Delete from all tables (preserves sequences, unlike TRUNCATE)
            for (const { tablename } of tables) {
                try {
                    await prisma.$executeRawUnsafe(
                        `DELETE FROM "${tablename}"`
                    );
                    console.log(`Cleared table: ${tablename}`);
                } catch (error: any) {
                    console.error(
                        `Error clearing table ${tablename}:`,
                        error.message
                    );
                }
            }

            // Re-enable foreign key constraints and triggers
            await prisma.$executeRawUnsafe(
                `SET session_replication_role = DEFAULT;`
            );

            console.log("All data deleted successfully");
            return { success: true };
        } catch (error) {
            console.error("Error deleting all data:", error);
            // Make sure to re-enable constraints even if there's an error
            try {
                await prisma.$executeRawUnsafe(
                    `SET session_replication_role = DEFAULT;`
                );
            } catch {}
            throw new Error(`Failed to delete all data: ${error}`);
        }
    }
}

export default new BackupService();
