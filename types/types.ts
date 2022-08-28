import { TelegramUser } from "telegram-login-button";
import { Data } from "../pages/api/import";
import { ClassState } from "../store/classesReducer";
import { ModuleWithClassDB } from "./db";

export type RootState = {classesInfo: ClassState, user: TelegramUser | null}

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

export interface ClassSwapRequest extends TelegramUser {
    swapId: number,
    moduleCode: string,
    lessonType: string,
    classNo: string,
    from: TelegramUser,
    status: "Open" | "Completed" | "Reserved",
    to: TelegramUser | null,
    requested: ClassOverview[],
    ay: string,
    semester: number,

}

export type ClassSwapFor = {
    rowId: number,
    wantedClassNo: string,
    swapId: number
}


