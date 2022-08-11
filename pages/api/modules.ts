import { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../lib/db";
import { canBeBidFor, sortByDay } from "../../lib/functions";
import { ModuleWithClassDB } from "../../types/db";
import { Module } from "../../types/modules";
import { ModuleCodeLessonType } from "../../types/types";

export type ResponseData = {
    success: boolean;
    error?: string;
    data?: ModuleCodeLessonType;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const ay = process.env.NEXT_PUBLIC_AY;
    const semester = process.env.NEXT_PUBLIC_SEM;

    if (req.method === "POST") {
        const { modules } = req.body as {
            modules: {
                moduleCode: string;
                // moduleName?: string;
            }[];
        };
 

        // check if each module is in  our database
        for (const module_ of modules) {
            const moduleCode = module_.moduleCode;
            const moduleExists = await executeQuery({
                query: `SELECT * FROM modulelist LEFT JOIN classlist ON modulelist.moduleCode = classlist.moduleCode WHERE modulelist.moduleCode = ? AND modulelist.lastUpdated > DATE_SUB(NOW(), INTERVAL 1 DAY);`,
                values: [module_.moduleCode],
            });

            if (moduleExists.length === 0) {
                console.log(
                    `${moduleCode} expired or doesn't exist, refreshing`
                );
                // const classData = await fetch(
                //     `https://api.nusmods.com/v2/${process.env.NEXT_PUBLIC_AY}/modules/${module.moduleCode}.json`
                // );

                // const classDataJSON = await classData.json();

                await executeQuery({
                    query: `DELETE FROM modulelist WHERE moduleCode = ?`,
                    values: [moduleCode],
                });

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
                    query: `DELETE FROM classlist WHERE ay = ? AND moduleCode = ?`,
                    values: [process.env.NEXT_PUBLIC_AY, moduleCode],
                });

                const classDataSem1 =
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
                            process.env.NEXT_PUBLIC_AY,
                            data.semesterData[0].semester,
                        ];
                    }) || [];
                const classDataSem2 =
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
                            process.env.NEXT_PUBLIC_AY,
                            data.semesterData[1].semester,
                        ];
                    }) || [];
                const classData = [...classDataSem1, ...classDataSem2];

                await executeQuery({
                    query: `INSERT INTO classlist (moduleCode, lessonType, classNo, day, startTime, endTime, venue, size, weeks, ay, semester) VALUES ?`,
                    values: [classData],
                });
            } else {
                console.log(`${moduleCode} exists`);
            }
        }

        // get the list of modules from the database
        const availableClassList: ModuleWithClassDB[] = await executeQuery({
            query: `SELECT * FROM modulelist LEFT JOIN classlist ON modulelist.moduleCode = classlist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ?`,
            values: [modules.map(module => module.moduleCode), process.env.NEXT_PUBLIC_AY, semester],
        });

    
        // Manipulate the availableClassList to the format we want
        const totalModuleCodeLessonTypeMap: ModuleCodeLessonType = {};
        availableClassList.forEach((availableClass) => {

            // Only add non-lectures because you don't bid for lecture slots in tutreg round
            if (canBeBidFor(availableClass.moduleCode, availableClass.lessonType)) {

            
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
            const classes = totalModuleCodeLessonTypeMap[moduleCodeLessonType].find(
                (classItem) => classItem.classNo === availableClass.classNo
            );
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

            }
        });



        res.status(200).json({
            success: true,
            data: totalModuleCodeLessonTypeMap,
        });
    } else {
        res.status(405).json({ success: false, error: "Method not allowed" });
    }
}
