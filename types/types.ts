import { Data } from "../pages/api/import";
import { ModuleWithClassDB } from "./db";

export type RootState = {classesInfo: Data}

export type ClassOverview = {
    classNo: string;
    moduleCode: string;
    lessonType: string;
    moduleName: string;
    size: number;
    classes: ModuleWithClassDB[];
}
export type ModuleCodeLessonType = {
    [moduleCodeLessonType: string]: ClassOverview[];
};


export type Option = {
    value: string;
    label: string;
}