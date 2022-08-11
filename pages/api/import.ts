// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../lib/db";
import { ModuleDB, ModuleWithClassDB } from "../../types/db";
import { Module } from "../../types/modules";
import { ModuleCodeLessonType } from "../../types/types";

export interface Data {
    selectedClasses: ModuleCodeLessonType;
    totalModuleCodeLessonTypeMap: ModuleCodeLessonType;
    moduleOrder: string[];
}

export type ResponseData = {
    success: boolean;
    error?: string;
    data?: Data;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === "POST") {
        const { url } = req.body;

        // validate URL
        if (!url) {
            res.status(400).json({ success: false, error: "URL is required" });
            return;
        }

        if (
            !url.startsWith("https://nusmods.com/timetable/sem-1/share?") &&
            !url.startsWith("https://nusmods.com/timetable/sem-2/share?")
        ) {
            res.status(400).json({ success: false, error: "Invalid URL" });
            return;
        }

        // get the semester from the link
        const semester = url.includes("sem-1") ? "1" : "2";

        // extract module codes
        const stripped = url.replace(
            /^https:\/\/nusmods\.com\/timetable\/.*\/share\?/gm,
            ""
        ); // CFG1002=&CS1101S=TUT:07B,REC:11E,LEC:1&CS1231S=TUT:08B,LEC:1&IS1108=TUT:03,LEC:1&MA2001=TUT:1,LAB:2,LEC:1&RVX1000=SEC:1&RVX1002=SEC:2
        // get the url params
        const params = new URLSearchParams(stripped);

        const classesSelected: {
            moduleCode: string;
            timetable: {
                [lessonType: string]: string; //lessonType is TUT / REC / LAB, basically what you see in the URL
            };
        }[] = [];

        for (const p of params) {
            const moduleCode = p[0];
            const selectedLessons = p[1];

            const lessons = selectedLessons.split(",");

            const timetable: { [key: string]: string } = {};
            lessons.forEach((lesson) => {
                if (lesson.includes(":")) {
                    const lessonType = lesson.split(":")[0];
                    const classNo = lesson.split(":")[1];

                    timetable[lessonType] = classNo;
                }
            });

            classesSelected.push({
                moduleCode,
                timetable,
            });
        }

        // console.log({classesSelected})
        const moduleCodes = classesSelected.map(
            (classselected) => classselected.moduleCode
        );

        // check if the system has up to date (1 day old or less) data for the semester and module codes for this AY
        let ay = process.env.AY;
        if (!ay) {
            console.log("no AY!");
            ay = "2022-2023";
        }
        for (const { moduleCode } of classesSelected) {
            const moduleData: ModuleDB[] = await executeQuery({
                query: `SELECT * FROM modulelist WHERE moduleCode = ?`,
                values: [moduleCode],
            });

            if (!moduleData.length) {
                // either expired or never imported
                // drop the module code from the list
                await executeQuery({
                    query: `DELETE FROM modulelist WHERE moduleCode = ?`,
                    values: [moduleCode],
                });

                console.log(
                    `${moduleCode} expired, refreshing at ${`https://api.nusmods.com/v2/${ay}/modules/${moduleCode}.json`}`
                );

                // make request to NUSMods for the module data
                const result = await fetch(
                    `https://api.nusmods.com/v2/${ay}/modules/${moduleCode}.json`
                );

                const data: Module = await result.json();

                if (!data) {
                    res.status(400).json({
                        success: false,
                        error: "Invalid response from NUSMods",
                    });
                    return;
                }

                // insert the module data into the database
                await executeQuery({
                    query: `INSERT INTO modulelist SET ?`,
                    values: [
                        {
                            moduleCode,
                            moduleName: data.title,
                        },
                    ],
                });

                // insert the class data into the database
                await executeQuery({
                    query: `DELETE FROM classList WHERE ay = ? AND moduleCode = ?`,
                    values: [process.env.AY, moduleCode],
                });

                let classDataSem1: any[] = []; // TODO
                if (data.semesterData[0]?.timetable) {
                    classDataSem1 =
                        data.semesterData[0]?.timetable.map((classItem) => {
                            return [
                                moduleCode,
                                classItem.lessonType,
                                classItem.classNo,
                                classItem.day,
                                classItem.startTime,
                                classItem.endTime,
                                classItem.venue,
                                classItem.size,
                                JSON.stringify(classItem.weeks),
                                process.env.AY,
                                data.semesterData[0].semester,
                            ];
                        }) || [];
                }

                let classDataSem2: any[] = []; // TODO
                if (data.semesterData[1]?.timetable) {
                    classDataSem2 =
                        data.semesterData[1]?.timetable.map((classItem) => {
                            return [
                                moduleCode,
                                classItem.lessonType,
                                classItem.classNo,
                                classItem.day,
                                classItem.startTime,
                                classItem.endTime,
                                classItem.venue,
                                classItem.size,
                                JSON.stringify(classItem.weeks),
                                process.env.AY,
                                data.semesterData[1].semester,
                            ];
                        }) || [];
                }
                const classData = [...classDataSem1, ...classDataSem2];

                console.log(`${classData.length} classes for ${moduleCode}`);
                await executeQuery({
                    query: `INSERT INTO classList (moduleCode, lessonType, classNo, day, startTime, endTime, venue, size, weeks, ay, semester) VALUES ?`,
                    values: [classData],
                });
            }
        }

        const availableClassList: ModuleWithClassDB[] = await executeQuery({
            query: `SELECT * FROM modulelist LEFT JOIN classlist ON modulelist.moduleCode = classlist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ?`,
            values: [moduleCodes, process.env.AY, semester],
        });

        // Manipulate the availableClassList to the format we want
        const totalModuleCodeLessonTypeMap: ModuleCodeLessonType = {};
        availableClassList.forEach((availableClass) => {
            const moduleCodeLessonType = `${availableClass.moduleCode}: ${availableClass.lessonType}`;
            if (!totalModuleCodeLessonTypeMap[moduleCodeLessonType]) {
                totalModuleCodeLessonTypeMap[moduleCodeLessonType] = [
                    {
                        classNo: availableClass.classNo,
                        lessonType: availableClass.lessonType,
                        moduleCode: availableClass.moduleCode,
                        moduleName: availableClass.moduleName,
                        size: availableClass.size,
                        classes: [],
                    },
                ];
            }

            // don't need to filter by lessonType and moduleCode because we are already in that group
            const classes = totalModuleCodeLessonTypeMap[
                moduleCodeLessonType
            ].find((classItem) => classItem.classNo === availableClass.classNo);
            if (classes) classes.classes.push(availableClass);
            else
                totalModuleCodeLessonTypeMap[moduleCodeLessonType].push({
                    classNo: availableClass.classNo,
                    lessonType: availableClass.lessonType,
                    moduleCode: availableClass.moduleCode,
                    moduleName: availableClass.moduleName,
                    size: availableClass.size,
                    classes: [availableClass],
                });
        });

        // Manipulate the classes selected to the correct data format
        const moduleCodeLessonTypeMap: ModuleCodeLessonType = {};

        console.log({ classesSelected });

        classesSelected.forEach(({ moduleCode, timetable }) => {
            Object.keys(timetable).forEach((lessonType) => {
                const classNo = timetable[lessonType];
                const classData = availableClassList.filter(
                    (classData) =>
                        classData.classNo === classNo &&
                        classData.lessonType
                            .toLowerCase()
                            .includes(lessonType.toLowerCase()) &&
                        classData.moduleCode === moduleCode
                ); // use filter bc there might be 2 of the same classNo / lessonType / moduleCode, aka when you have 2 tuts per wk
                console.log({ classData });
                if (classData) {
                    const moduleCodeLessonType = `${moduleCode}: ${classData[0].lessonType}`;

                    if (!moduleCodeLessonTypeMap[moduleCodeLessonType]) {
                        moduleCodeLessonTypeMap[moduleCodeLessonType] = [
                            {
                                moduleCode: moduleCode,
                                lessonType: classData[0].lessonType,
                                classNo: classData[0].classNo,
                                classes: [],
                                moduleName: classData[0].moduleName,
                                size: classData[0].size,
                            },
                        ];
                    }

                    const classes = moduleCodeLessonTypeMap[
                        moduleCodeLessonType
                    ].find((classItem) => classItem.classNo === classNo);
                    if (classes) classes.classes.push(...classData);
                    else
                        moduleCodeLessonTypeMap[moduleCodeLessonType].push({
                            moduleCode: moduleCode,
                            lessonType: classData[0].lessonType,
                            classNo: classData[0].classNo,
                            classes: [],
                            moduleName: classData[0].moduleName,
                            size: classData[0].size,
                        });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                selectedClasses: moduleCodeLessonTypeMap,
                totalModuleCodeLessonTypeMap: totalModuleCodeLessonTypeMap,
                moduleOrder: Object.keys(moduleCodeLessonTypeMap),
            },
        });
    } else {
        res.status(405).json({ success: false, error: "Method not allowed" });
    }
}
