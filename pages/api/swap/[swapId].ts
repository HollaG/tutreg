// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import executeQuery from "../../../lib/db";
import { ClassDB, ModuleWithClassDB } from "../../../types/db";
import {
    ClassOverview,
    ClassSwapFor,
    ClassSwapRequest,
} from "../../../types/types";
import { convertToTimetableList, FullInfo, HalfInfo } from "../../swap/create";

export type SpecificSwapResponseData = {
    error?: string;
    success: boolean;
    data?: GetSwapClassesData | TelegramUser[];
};

export type GetSwapClassesData = {
    drawnClasses: ClassOverview[];
    swap: ClassSwapRequest;
    currentClassInfo: FullInfo;
    desiredClasses: FullInfo[];
    desiredModules: HalfInfo[];
    isInternalSwap: boolean; // true when the moduleCode and lessonType are the same, and there is only one desired moduleCode/LessonType combi
};
type GroupedByClassNo = {
    [classNo: string]: ModuleWithClassDB[];
};
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SpecificSwapResponseData>
) {
    const { swapId } = req.query;
    try {
        if (req.method === "GET") {
            // 1) get this swap
            const swapDb: ClassSwapRequest[] = await executeQuery({
                query: "SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE swapId = ?",
                values: [swapId],
            });

            // error handling
            if (!swapDb.length)
                return res.status(400).json({
                    error: "Swap not found",
                    success: false,
                });

            const swap = swapDb[0];

            // 2) get the requested classes
            const requestedClassesDb: ClassSwapFor[] = await executeQuery({
                query: `SELECT * FROM swaps_list WHERE swapId IN (?)`,
                values: [swap.swapId],
            });

            const desiredClasses = requestedClassesDb.map((requestedClass) => ({
                moduleCode: requestedClass.wantedModuleCode,
                lessonType: requestedClass.wantedLessonType,
                classNo: requestedClass.wantedClassNo,
            })) as FullInfo[];

            // for every moduleCode and lessonType in both the current class and the desired classes, get the list of available classes
            // TODO: see if we can optimize this by doing a single query using the `IN` operator
            const moduleCodeLessonTypes = [
                {
                    moduleCode: swap.moduleCode,
                    lessonType: swap.lessonType,
                    classNo: swap.classNo,
                },
                ...desiredClasses,
            ];

            const drawnClasses: ClassOverview[] = [];

            const uniqueDesiredModules = new Set<string>();
            for (const moduleCodeLessonType of moduleCodeLessonTypes) {
                uniqueDesiredModules.add(
                    `${moduleCodeLessonType.moduleCode}: ${moduleCodeLessonType.lessonType}`
                );
                const { moduleCode, lessonType, classNo } =
                    moduleCodeLessonType;

                const possiblyDrawnClassesForThisModule: ModuleWithClassDB[] =
                    await executeQuery({
                        query: `SELECT * FROM classlist LEFT JOIN moduleList ON classlist.moduleCode = modulelist.moduleCode WHERE classlist.moduleCode = ? AND classlist.lessonType = ? AND classlist.classNo = ? AND ay = ? AND semester = ?`,
                        values: [
                            moduleCode,
                            lessonType,
                            classNo,
                            swap.ay,
                            swap.semester,
                        ],
                    });

                // might be more than 1: see linked classes.
                // group them by classNumber
                const groupedByClassNo: GroupedByClassNo = {
                    [classNo]: possiblyDrawnClassesForThisModule,
                };

                // convert to a timetable format
                const drawnClassesForThis =
                    convertToTimetableList(groupedByClassNo);

                if (drawnClassesForThis.length) {
                    drawnClasses.push(...drawnClassesForThis);
                }
            }

            if (!drawnClasses.length) {
                return res.status(400).json({
                    error: "Class data not found",
                    success: false,
                });
            }

            const desiredModules = [...uniqueDesiredModules].map((m) => ({
                moduleCode: m.split(":")[0].trim(),
                lessonType: m.split(":")[1].trim(),
            })) as HalfInfo[];

            // return this data to the client
            const data = {
                drawnClasses,
                swap,

                currentClassInfo: {
                    moduleCode: swap.moduleCode,
                    lessonType: swap.lessonType,
                    classNo: swap.classNo,
                } as FullInfo,

                desiredClasses,
                desiredModules,
                isInternalSwap:
                    desiredModules.length === 1 &&
                    desiredModules[0].moduleCode === swap.moduleCode &&
                    desiredModules[0].lessonType === swap.lessonType,
            };

            return res.status(200).json({
                success: true,
                data,
            });

            // const possiblyDrawnClasses = await executeQuery({
            //     query: `SELECT * FROM classlist LEFT JOIN modulelist ON classlist.moduleCode = modulelist.moduleCode WHERE classlist.moduleCode IN (?) AND classlist.lessonType IN (?) AND `,
            // })

            // filter the list of available classes to only include the current and desired classes

            // db request to get the swap
            // const swapDb: ClassSwapRequest[] = await executeQuery({
            //     query: "SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE swapId = ?",
            //     values: [swapId],
            // });

            // if (!swapDb.length)
            //     return res.status(400).json({
            //         error: "Swap not found",
            //         success: false,
            //     });

            // const swap = swapDb[0];

            // // Get the class data that was requested for
            // const requestedClasses: ClassSwapFor[] = await executeQuery({
            //     query: `SELECT * FROM swaps_list WHERE swapId IN (?)`,
            //     values: [swap.swapId],
            // });

            // const requestedClassNos = requestedClasses.map(
            //     (classSwapFor) => classSwapFor.wantedClassNo
            // );

            // const classData: ModuleWithClassDB[] = await executeQuery({
            //     query: `SELECT * FROM classlist LEFT JOIN modulelist ON classlist.moduleCode = modulelist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ? AND classlist.lessonType = ? AND classlist.classNo IN (?)`,
            //     values: [
            //         swap.moduleCode,
            //         process.env.NEXT_PUBLIC_AY,
            //         process.env.NEXT_PUBLIC_SEM,
            //         swap.lessonType,
            //         [
            //             ...requestedClasses.map(
            //                 (requestedClass) => requestedClass.wantedClassNo
            //             ),
            //             swap.classNo,
            //         ],
            //     ],
            // });

            // if (!classData) {
            //     return res.status(400).json({
            //         error: "Class data not found",
            //         success: false,
            //     });
            // }

            // // group classData by classNo
            // const groupedByClassNo = classData.reduce<GroupedByClassNo>(
            //     (r, a) => {
            //         r[a.classNo] = [...(r[a.classNo] || []), a];
            //         return r;
            //     },
            //     {}
            // );

            // res.status(200).json({
            //     success: true,
            //     data: {
            //         swap,
            //         groupedByClassNo,
            //         requestedClassNos,
            //     },
            // });
        }

        if (req.method === "POST") {
            const user = req.body;

            if (user) {
                // ensure correct user - the hash must match
                const userExists = await executeQuery({
                    query: "SELECT * FROM users WHERE id = ? AND hash = ?",
                    values: [user.id, user.hash],
                });

                if (!userExists)
                    return res.status(401).json({
                        success: false,
                        error: "Not authorized!",
                    });
            }
            // db request to get the swap
            const swapDb: ClassSwapRequest[] = await executeQuery({
                query: "SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE swapId = ?",
                values: [swapId],
            });

            // find all users whose ID is in requestors, if any
            const requestorString = swapDb[0].requestors.trim();
            // remove empty elements
            const requestors = requestorString.split(",").filter((x) => x);

            const users: TelegramUser[] = await executeQuery({
                query: `SELECT * FROM users WHERE id IN (?)`,
                values: [requestors.length ? requestors : [0]],
            });

            let cleanedUsers = user
                ? users
                : users.map((user) => {
                      const copiedUser = { ...user };
                      copiedUser.hash = "";
                      copiedUser.auth_date = 0;
                      // copiedUser.id = 0
                      copiedUser.username = "";
                      return copiedUser;
                  });

            return res.status(200).json({
                success: true,
                data: cleanedUsers,
            });
        }

        if (req.method === "DELETE") {
            const user = req.body;

            // validate that user's hash and id match the db, to allow them to delete
            const userExists = await executeQuery({
                query: "SELECT * FROM users WHERE id = ? AND hash = ?",
                values: [user.id, user.hash],
            });

            if (!userExists)
                return res.status(401).json({
                    success: false,
                    error: "Not authorized!",
                });

            // delete the swap
            await executeQuery({
                query: "DELETE FROM swaps WHERE swapId = ?",
                values: [swapId],
            });

            return res.status(200).json({
                success: true,
            });
        }

        if (req.method === "PATCH") {
            const user = req.body;

            // validate that user's hash and id match the db, to allow them to delete
            const userExists = await executeQuery({
                query: "SELECT * FROM users WHERE id = ? AND hash = ?",
                values: [user.id, user.hash],
            });

            if (!userExists)
                return res.status(401).json({
                    success: false,
                    error: "Not authorized!",
                });

            // delete the swap
            await executeQuery({
                query: "UPDATE swaps SET status = ? WHERE swapId = ?",
                values: ["Completed", swapId],
            });

            return res.status(200).json({
                success: true,
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: "Internal server error",
            success: false,
        });
    }
}
