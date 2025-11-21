import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    getAllSections,
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    addSchedule,
    deleteSchedule,
} from "./sections.controller";
import {
    createSectionSchema,
    updateSectionSchema,
    getSectionSchema,
    deleteSectionSchema,
    addScheduleSchema,
    deleteScheduleSchema,
} from "./sections.validator";

const router = Router();

router.get("/", authMiddleware, getAllSections);
router.get(
    "/:id",
    authMiddleware,
    validateRequest(getSectionSchema),
    getSectionById
);
router.post(
    "/",
    authMiddleware,
    validateRequest(createSectionSchema),
    createSection
);
router.put(
    "/:id",
    authMiddleware,
    validateRequest(updateSectionSchema),
    updateSection
);
router.delete(
    "/:id",
    authMiddleware,
    validateRequest(deleteSectionSchema),
    deleteSection
);
router.post(
    "/:id/schedules",
    authMiddleware,
    validateRequest(addScheduleSchema),
    addSchedule
);
router.delete(
    "/:id/schedules/:scheduleId",
    authMiddleware,
    validateRequest(deleteScheduleSchema),
    deleteSchedule
);

export default router;
