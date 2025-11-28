import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import prisma from "../../config/database";

const execAsync = promisify(exec);

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

export class BackupService {
    private backupDir = process.env.NETLIFY
        ? "/tmp/backups"
        : path.join(process.cwd(), "backups");

    async ensureBackupDirectory() {
        try {
            await fs.access(this.backupDir);
        } catch {
            await fs.mkdir(this.backupDir, { recursive: true });
        }
    }

    async createBackup(): Promise<{
        success: boolean;
        filename: string;
        path: string;
    }> {
        try {
            await this.ensureBackupDirectory();

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `backup-${timestamp}.sql`;
            const filePath = path.join(this.backupDir, filename);

            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error("DATABASE_URL not found");
            }

            // Parse database URL
            const url = new URL(dbUrl);
            const dbName = url.pathname.slice(1);
            const dbHost = url.hostname;
            const dbPort = url.port || "5432";
            const dbUser = url.username;
            const dbPassword = url.password;

            // Use pg_dump to create complete backup with all data
            // Options:
            // -F p: Plain text format (SQL commands)
            // --data-only: Only data (no schema) - REMOVED to include schema
            // --inserts: Use INSERT commands instead of COPY (more compatible)
            // --column-inserts: Include column names in INSERT commands
            // --no-owner: Don't set ownership
            // --no-privileges: Don't dump privileges
            console.log("Creating backup with all data and schema...");
            const command = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p --inserts --column-inserts --no-owner --no-privileges -f "${filePath}"`;

            const { stdout, stderr } = await execAsync(command);

            if (stderr && !stderr.includes("WARNING")) {
                console.error("pg_dump stderr:", stderr);
            }
            if (stdout) {
                console.log("pg_dump stdout:", stdout);
            }

            // Verify backup file was created and has content
            const stats = await fs.stat(filePath);
            if (stats.size === 0) {
                throw new Error("Backup file is empty");
            }

            console.log(
                `Backup created successfully: ${filename} (${stats.size} bytes)`
            );

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

    async restoreBackup(filePath: string): Promise<{ success: boolean }> {
        try {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error("DATABASE_URL not found");
            }

            // Parse database URL
            const url = new URL(dbUrl);
            const dbName = url.pathname.slice(1);
            const dbHost = url.hostname;
            const dbPort = url.port || "5432";
            const dbUser = url.username;
            const dbPassword = url.password;

            // Drop and recreate the database schema (easier and cleaner)
            // This automatically handles all tables without listing them
            console.log("Dropping all tables and recreating schema...");

            // Drop all tables, sequences, views, and types (enums) in the public schema
            await prisma.$executeRawUnsafe(`
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    -- Drop all tables
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                    
                    -- Drop all sequences
                    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
                        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
                    END LOOP;
                    
                    -- Drop all views
                    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') LOOP
                        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
                    END LOOP;
                    
                    -- Drop all types (enums)
                    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
                        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
                    END LOOP;
                END $$;
            `);

            // Use psql to restore backup
            // This will recreate all tables and insert all data
            // --single-transaction: Run restore in a single transaction (safer)
            // -v ON_ERROR_STOP=1: Stop on first error
            console.log("Restoring backup from:", filePath);
            const command = `PGPASSWORD=${dbPassword} psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --single-transaction -v ON_ERROR_STOP=1 -f "${filePath}"`;

            const { stdout, stderr } = await execAsync(command);

            if (stderr) {
                console.log("psql stderr (may include notices):", stderr);
            }
            if (stdout) {
                console.log("psql stdout:", stdout);
            }

            console.log("Backup restored successfully");
            return { success: true };
        } catch (error) {
            console.error("Backup restoration error:", error);
            throw new Error(`Failed to restore backup: ${error}`);
        }
    }

    async restoreFromFile(filename: string): Promise<{ success: boolean }> {
        const filePath = path.join(this.backupDir, filename);
        // Check if file exists
        await fs.access(filePath);
        return this.restoreBackup(filePath);
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
            // Get all admin users first to preserve them
            const adminUsers = await prisma.user.findMany({
                where: {
                    role: { in: ["SUPER_ADMIN", "ADMIN"] },
                },
            });

            // Dynamically truncate all tables except _prisma_migrations
            // This automatically handles any new tables you add
            await prisma.$executeRawUnsafe(`
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    -- Disable triggers temporarily
                    SET session_replication_role = replica;
                    
                    -- Truncate all tables except system tables
                    FOR r IN (
                        SELECT tablename 
                        FROM pg_tables 
                        WHERE schemaname = 'public' 
                        AND tablename NOT LIKE '_prisma_%'
                    ) LOOP
                        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
                    END LOOP;
                    
                    -- Re-enable triggers
                    SET session_replication_role = DEFAULT;
                END $$;
            `);

            // Recreate admin users
            for (const user of adminUsers) {
                await prisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        role: user.role,
                        status: user.status,
                    },
                });
            }

            console.log(
                "All data deleted successfully (admin accounts preserved)"
            );
            return { success: true };
        } catch (error) {
            console.error("Error deleting all data:", error);
            throw new Error(`Failed to delete all data: ${error}`);
        }
    }
}

export default new BackupService();
