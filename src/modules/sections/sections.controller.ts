import { Request, Response, NextFunction } from "express";
import sectionsService from "./sections.service";
import {
    CreateSectionDTO,
    UpdateSectionDTO,
    AddScheduleDTO,
} from "./sections.types";

export const getAllSections = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sections = await sectionsService.getAllSections(req.query);
        res.json({
            success: true,
            data: {
                sections,
                total: sections.length,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getSectionById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const section = await sectionsService.getSectionById(id);

        if (!section) {
            res.status(404).json({
                error: "Section not found",
                message: `Section with ID ${id} does not exist`,
            });
            return;
        }

        res.json(section);
    } catch (error) {
        next(error);
    }
};

export const createSection = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sectionData: CreateSectionDTO = req.body;
        const newSection = await sectionsService.createSection(sectionData);
        res.status(201).json(newSection);
    } catch (error) {
        next(error);
    }
};

export const updateSection = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const sectionData: UpdateSectionDTO = req.body;
        const updatedSection = await sectionsService.updateSection(
            id,
            sectionData
        );

        if (!updatedSection) {
            res.status(404).json({
                error: "Section not found",
                message: `Section with ID ${id} does not exist`,
            });
            return;
        }

        res.json(updatedSection);
    } catch (error) {
        next(error);
    }
};

export const deleteSection = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const result = await sectionsService.deleteSection(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const addSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const scheduleData: AddScheduleDTO = req.body;
        const schedule = await sectionsService.addSchedule(id, scheduleData);
        res.status(201).json(schedule);
    } catch (error) {
        next(error);
    }
};

export const deleteSchedule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id, scheduleId } = req.params;
        const result = await sectionsService.deleteSchedule(id, scheduleId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
