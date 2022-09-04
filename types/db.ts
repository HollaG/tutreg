export type ModuleDB = {
    moduleCode: string;
    moduleName: string;
    lastUpdated: Date;
};
export type ClassDB = {
    // uniqueClassId: number;
    moduleCode: string;
    venue: string;
    lessonType: "Tutorial" | "Lecture" | "Sectional" | "Lab";
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
