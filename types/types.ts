import { TelegramUser } from "telegram-login-button";
import { Data } from "../pages/api/import";
import { ClassState } from "../store/classesReducer";
import { MiscState } from "../store/misc";
import { ModuleWithClassDB } from "./db";
import { LessonType } from "./modules";

export type RootState = {
    classesInfo: ClassState;
    user: TelegramUser | null | null;
    misc: MiscState;
};

export type ClassOverview = {
    classNo: string;
    moduleCode: string;
    lessonType: LessonType;
    moduleName: string;
    size: number;
    classes: ModuleWithClassDB[];
};
export type ModuleCodeLessonType = {
    [moduleCodeLessonType: string]: ClassOverview[];
};

export type Option = {
    value: string;
    label: string;
};

export interface ClassSwapRequest extends TelegramUser {
    swapId: number;
    moduleCode: string;
    lessonType: LessonType;
    classNo: string;
    from_t_id: number;
    status: "Open" | "Completed" | "Reserved";
    requestors: string; // csv of telegram ids
    to_t_id: number | null;
    requested: ClassOverview[];
    ay: string;
    semester: number;
    createdAt: Date;
}

export interface ClassSwapRequestDB {
    swapId: number;
    moduleCode: string;
    lessonType: string;
    classNo: string;
    from_t_id: number;
    status: "Open" | "Completed" | "Reserved";
    requestors: string; // csv of telegram ids
    to_t_id: number | null;
    ay: string;
    semester: number;
    createdAt: Date;
}


export type ClassSwapFor = {
    rowId: number;
    wantedClassNo: string;
    swapId: number;
};


export interface BasicResponse {
    success: boolean,
    error?: any;
    data?: any
}