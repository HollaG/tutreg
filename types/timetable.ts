import { ModuleWithClassDB } from "./db";
import { Day } from "./modules";

export interface TimetableLessonBasic {
    pushDown: number
}

export interface TimetableLessonEntry extends ModuleWithClassDB {
    // startTime: number,
    // endTime: number,
    // day: string,
    pushDown: number;
    minutesUntilPrevClass: number; // in px
    id: string;
    overlaps: string[];
    disabled?: boolean,
    unselectable?: boolean,
}

export type DayRows = {
    [day in Day]: number;
};