export const PERMISSIONS = {
    // System Management
    SYSTEM_CONFIGURE: "system.configure",

    // User Management
    USERS_VIEW_ALL: "users.view_all",
    USERS_CREATE: "users.create",
    USERS_UPDATE: "users.update",
    USERS_DELETE: "users.delete",

    // Student Management
    STUDENTS_VIEW_ALL: "students.view_all",
    STUDENTS_VIEW_OWN: "students.view_own",
    STUDENTS_VIEW_MY_COURSES: "students.view_my_courses",
    STUDENTS_CREATE: "students.create",
    STUDENTS_UPDATE: "students.update",
    STUDENTS_DELETE: "students.delete",

    // Faculty Management
    FACULTY_VIEW_ALL: "faculty.view_all",
    FACULTY_CREATE: "faculty.create",
    FACULTY_UPDATE: "faculty.update",
    FACULTY_DELETE: "faculty.delete",

    // Course Management
    COURSES_VIEW_ALL: "courses.view_all",
    COURSES_CREATE: "courses.create",
    COURSES_UPDATE: "courses.update",
    COURSES_DELETE: "courses.delete",

    // Grade Management
    GRADES_VIEW_ALL: "grades.view_all",
    GRADES_VIEW_OWN: "grades.view_own",
    GRADES_VIEW_MY_COURSES: "grades.view_my_courses",
    GRADES_CREATE: "grades.create",
    GRADES_UPDATE: "grades.update",
    GRADES_PUBLISH: "grades.publish",

    // Attendance Management
    ATTENDANCE_VIEW: "attendance.view",
    ATTENDANCE_MANAGE: "attendance.manage",

    // Registration
    REGISTRATION_ENROLL: "registration.enroll",
    REGISTRATION_DROP: "registration.drop",
    REGISTRATION_OVERRIDE: "registration.override",

    // Specialization
    SPECIALIZATION_SELECT: "specialization.select",
    SPECIALIZATION_ASSIGN: "specialization.assign",

    // Requests
    REQUESTS_CREATE: "requests.create",
    REQUESTS_VIEW_OWN: "requests.view_own",
    REQUESTS_VIEW_ALL: "requests.view_all",
    REQUESTS_APPROVE: "requests.approve",

    // Reports
    REPORTS_VIEW: "reports.view",
    REPORTS_GENERATE: "reports.generate",

    // Content Management
    MATERIALS_UPLOAD: "materials.upload",
    MATERIALS_DELETE: "materials.delete",

    // Announcements
    ANNOUNCEMENTS_CREATE: "announcements.create",
    ANNOUNCEMENTS_UPDATE: "announcements.update",
    ANNOUNCEMENTS_DELETE: "announcements.delete",

    // Bonus/Deductions
    BONUS_GRANT: "bonus.grant",
} as const;

export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: Object.values(PERMISSIONS),

    ADMIN: [
        PERMISSIONS.USERS_VIEW_ALL,
        PERMISSIONS.STUDENTS_VIEW_ALL,
        PERMISSIONS.STUDENTS_CREATE,
        PERMISSIONS.STUDENTS_UPDATE,
        PERMISSIONS.FACULTY_VIEW_ALL,
        PERMISSIONS.FACULTY_CREATE,
        PERMISSIONS.FACULTY_UPDATE,
        PERMISSIONS.COURSES_VIEW_ALL,
        PERMISSIONS.COURSES_CREATE,
        PERMISSIONS.COURSES_UPDATE,
        PERMISSIONS.GRADES_VIEW_ALL,
        PERMISSIONS.ATTENDANCE_VIEW,
        PERMISSIONS.REGISTRATION_OVERRIDE,
        PERMISSIONS.SPECIALIZATION_ASSIGN,
        PERMISSIONS.REQUESTS_VIEW_ALL,
        PERMISSIONS.REQUESTS_APPROVE,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_GENERATE,
    ],

    FACULTY: [
        PERMISSIONS.STUDENTS_VIEW_MY_COURSES,
        PERMISSIONS.GRADES_VIEW_MY_COURSES,
        PERMISSIONS.GRADES_CREATE,
        PERMISSIONS.GRADES_UPDATE,
        PERMISSIONS.GRADES_PUBLISH,
        PERMISSIONS.ATTENDANCE_MANAGE,
        PERMISSIONS.MATERIALS_UPLOAD,
        PERMISSIONS.ANNOUNCEMENTS_CREATE,
        PERMISSIONS.BONUS_GRANT,
    ],

    TA: [
        PERMISSIONS.STUDENTS_VIEW_MY_COURSES,
        PERMISSIONS.GRADES_VIEW_MY_COURSES,
        PERMISSIONS.GRADES_CREATE,
        PERMISSIONS.ATTENDANCE_MANAGE,
        PERMISSIONS.MATERIALS_UPLOAD,
    ],

    STUDENT: [
        PERMISSIONS.STUDENTS_VIEW_OWN,
        PERMISSIONS.GRADES_VIEW_OWN,
        PERMISSIONS.ATTENDANCE_VIEW,
        PERMISSIONS.REGISTRATION_ENROLL,
        PERMISSIONS.REGISTRATION_DROP,
        PERMISSIONS.SPECIALIZATION_SELECT,
        PERMISSIONS.REQUESTS_CREATE,
        PERMISSIONS.REQUESTS_VIEW_OWN,
    ],
};
