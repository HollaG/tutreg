import { Data } from "../pages/api/import";
import { ClassState } from "../store/classesReducer";
import { ModuleWithClassDB } from "./db";

export type RootState = {classesInfo: ClassState}

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