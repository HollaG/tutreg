// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../lib/db";
import { decodeLessonTypeShorthand, formatWeeks } from "../../lib/functions";
import { ModuleDB, ModuleWithClassDB } from "../../types/db";
import { LessonType, LessonTypeAbbrev, Module } from "../../types/modules";
import { ModuleCodeLessonType } from "../../types/types";

export interface Data {
    selectedClasses: ModuleCodeLessonType;
    totalModuleCodeLessonTypeMap: ModuleCodeLessonType;
    moduleOrder: string[];
}

export type ImportResponseData = {
    success: boolean;
    error?: string;
    data?: Data;
};

let ay = process.env.NEXT_PUBLIC_AY;
let sem = process.env.NEXT_PUBLIC_SEM;
const moduleCache = new Map<string, any>();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ImportResponseData>
) {
    try {
        if (req.method === "POST") {
            let { url } = req.body;

            // validate URL
            if (!url) {
                res.status(400).json({
                    success: false,
                    error: "URL is required!",
                });
                return;
            }

            if (url.includes("shorten.nusmods.com")) {
                // if URL is a short URL, make a fetch request to get the actual url
                const response = await fetch(url, {
                    method: "GET",
                    redirect: "manual", // Prevent auto-following redirects
                });

                if (response.status === 302 || response.status === 301) {
                    url = response.headers.get("Location"); // Get redirected URL

                } else {
                    console.error("No redirection occurred.");
                    return res.status(400).json({
                        success: false,
                        error: "Invalid URL! Please check the URL and try again.",
                    });
                }
            }



            if (
                !url.startsWith("https://nusmods.com/timetable/sem-1/share?") &&
                !url.startsWith("https://nusmods.com/timetable/sem-2/share?")
            ) {
                res.status(400).json({
                    success: false,
                    error: "Invalid URL! Please check the URL and try again.",
                });
                return;
            }

            // get the semester from the link
            const semester = url.includes("sem-1") ? "1" : "2";

            // extract module codes
            const stripped = url
                .replace(
                    /^https:\/\/nusmods\.com\/timetable\/.*\/share\?/gm,
                    ""
                )
                .trim(); // CFG1002=&CS1101S=TUT:07B,REC:11E,LEC:1&CS1231S=TUT:08B,LEC:1&IS1108=TUT:03,LEC:1&MA2001=TUT:1,LAB:2,LEC:1&RVX1000=SEC:1&RVX1002=SEC:2
            // get the url params
            const params = new URLSearchParams(stripped);

            const classesSelected: {
                moduleCode: string;
                timetable: {
                    [lessonType: string]: string; //lessonType is TUT / REC / LAB, basically what you see in the URL
                };
            }[] = [];

            // check if there's any hidden modules (by hidden key)
            let hiddenModules: string[] = [];
            if (params.has("hidden")) {
                hiddenModules = params.get("hidden")!.split(",");
                params.delete("hidden");
            }

            // check if there's any TA modules (by ta key)
            let taModules: string[] = [];
            if (params.has("ta")) {
                taModules = params.get("ta")!.split(",");
                params.delete("ta");

                console.log("INFO:: HAS TA")
                console.log(taModules)

            }

            for (const p of params) {
                // p: [moduleCode, selectedLessons]
                const moduleCode = p[0];
                const selectedLessons = p[1];

                // skip over this if the module is hidden
                if (hiddenModules.includes(moduleCode)) {
                    continue;
                }

                // skip over this if it's a TA module
                if (taModules.some(taModule => taModule.includes(moduleCode))) {
                    continue
                }

                const lessons = selectedLessons.split(";");

                const timetable: { [key: string]: string } = {};
				for (const lesson of lessons) {
                    if (lesson.includes(":")) {
                        let lessonType = lesson.split(
                            ":"
                        )[0] as LessonTypeAbbrev;

                        const classIndicesStr: string = lesson.split(":")[1];
                        const classIndices = getIndicesFromString(classIndicesStr)

                        // Get classNo

						const data = await getModuleData(moduleCode);
						const array = getSemesterTimetable(data, sem);
						const classNos = new Set<string>;

						for (const classIndex of classIndices) {

							// URL is invalid if the index is out of range
							const length = array.length;

							if (classIndex < 0 || classIndex >= length) {
								return res.status(400).json({
									success: false,
									error: "(153) Invalid URL! Please refresh NUSMods, re-generate URL, and try again.",
								});
							}

							// URL is invalid if the index does not correspond to the correct lesson type
							if (array[classIndex].lessonType != decodeLessonTypeShorthand(lessonType)) {
								return res.status(400).json({
									success: false,
									error: "Invalid URL! Please re-generate URL from NUSMods and try again.",
								});
							}

							const classNo = array[classIndex].classNo;
							classNos.add(classNo);
						}

						// URL is invalid if indices for 1 lesson type correspond to multiple class numbers
						if (classNos.size != 1) {
							return res.status(400).json({
								success: false,
								error: "Invalid URL! Please re-generate URL from NUSMods and try again.",
							});
						}

						const classNosArray = [... classNos];

                        const decodedLessonType =
                            decodeLessonTypeShorthand(lessonType);
                        timetable[decodedLessonType] = classNosArray[0];
                    }

				}

                classesSelected.push({
                    moduleCode,
                    timetable,
                });
            }

            const moduleCodes = classesSelected.map(
                (classselected) => classselected.moduleCode
            );

            // check if the system has up to date (1 day old or less) data for the semester and module codes for this AY

            for (const { moduleCode } of classesSelected) {
                console.log(`Running loop for ${moduleCode}`);
				await executeQuery({
					query: `DELETE FROM modulelist WHERE moduleCode = ?`,
					values: [moduleCode],
				});

				const data: Module = moduleCache.get(moduleCode).data


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

				let classDataSem1: any[] = []; // TODO

				if (data.semesterData?.[0]?.timetable) {
					classDataSem1 =
						data.semesterData[0].timetable.map((classItem) => {
							return [
								moduleCode,
								classItem.lessonType,
								classItem.classNo,
								classItem.day,
								classItem.startTime,
								classItem.endTime,
								classItem.venue || "No venue",
								classItem.size,
								JSON.stringify(
									formatWeeks(classItem.weeks)
								),
								process.env.NEXT_PUBLIC_AY,
								data.semesterData[0].semester,
							];
						}) || [];
				}

				let classDataSem2: any[] = []; // TODO
				if (data.semesterData?.[1]?.timetable) {
					classDataSem2 =
						data.semesterData[1].timetable.map((classItem) => {
							return [
								moduleCode,
								classItem.lessonType,
								classItem.classNo,
								classItem.day,
								classItem.startTime,
								classItem.endTime,
								classItem.venue || "No venue",
								classItem.size,
								JSON.stringify(
									formatWeeks(classItem.weeks)
								),
								process.env.NEXT_PUBLIC_AY,
								data.semesterData[1].semester,
							];
						}) || [];
				}
				const classData = [...classDataSem1, ...classDataSem2];

				if (classData.length) {
					const result = await executeQuery({
						query: `INSERT INTO classlist (moduleCode, lessonType, classNo, day, startTime, endTime, venue, size, weeks, ay, semester) VALUES ?`,
						values: [classData],
					});
				}
            }

            const availableClassList: ModuleWithClassDB[] = await executeQuery({
                query: `SELECT * FROM modulelist LEFT JOIN classlist ON modulelist.moduleCode = classlist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ?`,
                values: [moduleCodes, process.env.NEXT_PUBLIC_AY, semester],
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
                ].find(
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
            });

            // Manipulate the classes selected to the correct data format
            const moduleCodeLessonTypeMap: ModuleCodeLessonType = {};

            classesSelected.forEach(({ moduleCode, timetable }) => {
                Object.keys(timetable).forEach((lessonType) => {
                    const classNo = timetable[lessonType];
                    const classData = availableClassList.filter(
                        (classData) =>
                            classData.classNo === classNo &&
                            classData.lessonType
                                .toLowerCase()
                                // todo - upodate this part to exact match
                                .includes(lessonType.toLowerCase()) &&
                            classData.moduleCode === moduleCode
                    ); // use filter bc there might be 2 of the same classNo / lessonType / moduleCode, aka when you have 2 tuts per wk

                    if (classData.length) {
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
            res.status(405).json({
                success: false,
                error: "Method not allowed",
            });
        }
    } catch (e) {
        console.log(e);
    }
}

function getIndicesFromString(classIndicesStr: string) : number[] {

	if (classIndicesStr.length <= 2) {
		return [];
	}

	classIndicesStr = classIndicesStr.slice(1, -1);

	return classIndicesStr.split(",").map((classIndexString) => Number(classIndexString));

}

function getSemesterTimetable(data: any, sem: string | undefined) {
	const semNum = Number(sem);
	for (let semesterData of data.semesterData) {
		if (semesterData.semester == semNum) {
			return semesterData.timetable;
		}
	}
}

async function getModuleData(moduleCode: string) {
	if (moduleCache.has(moduleCode)) {
		const now = Date.now();
		if (moduleCache.get(moduleCode).expiry > now) {
			console.log(`${moduleCode} data obtained from cache`);
			return moduleCache.get(moduleCode).data;
		}
		moduleCache.delete(moduleCode);
	}	

	const result = await fetch(
		`https://api.nusmods.com/v2/${ay}/modules/${moduleCode}.json`
	);

	const data = await result.json();

	moduleCache.set(moduleCode, {
		data: data,
		expiry: Date.now() + (15 * 60 * 1000)
	});
	console.log(`Added ${moduleCode} data to cache with expiry ${new Date(moduleCache.get(moduleCode).expiry).toString()}`)

	return data;
}

