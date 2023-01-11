import { LessonType } from "./modules";

export type ModuleDB = {
    moduleCode: string;
    moduleName: string;
    lastUpdated: Date;
};
export type ClassDB = {
    // uniqueClassId: number;
    moduleCode: string;
    venue: string;
    lessonType: LessonType;
    classNo: string;
    startTime: string;
    endTime: string;
    weeks: number[];
    lastUpdated: Date;
    ay: string;
    sem: number;
    size: number,
    day: string
};

export type ModuleWithClassDB = ClassDB & ModuleDB;
