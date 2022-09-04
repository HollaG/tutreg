// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import executeQuery from "../../../lib/db";
import { ModuleWithClassDB } from "../../../types/db";
import { ClassSwapFor, ClassSwapRequest } from "../../../types/types";

type SpecificSwapResponseData = {
    error?: string;
    success: boolean;
    data?: SpecificSwapData | TelegramUser[];
};

export type SpecificSwapData = {
    swap: ClassSwapRequest;
    groupedByClassNo: GroupedByClassNo;
    requestedClassNos: string[];
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
            // db request to get the swap
            const swapDb: ClassSwapRequest[] = await executeQuery({
                query: "SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE swapId = ?",
                values: [swapId],
            });
           
            if (!swapDb.length)
                return res.status(400).json({
                    error: "Swap not found",
                    success: false,
                });

            const swap = swapDb[0];

            // Get the class data that was requested for
            const requestedClasses: ClassSwapFor[] = await executeQuery({
                query: `SELECT * FROM swaps_list WHERE swapId IN (?)`,
                values: [swap.swapId],
            });

            const requestedClassNos = requestedClasses.map(
                (classSwapFor) => classSwapFor.wantedClassNo
            );

            const classData: ModuleWithClassDB[] = await executeQuery({
                query: `SELECT * FROM classlist LEFT JOIN modulelist ON classlist.moduleCode = modulelist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ? AND classlist.lessonType = ? AND classlist.classNo IN (?)`,
                values: [
                    swap.moduleCode,
                    process.env.NEXT_PUBLIC_AY,
                    process.env.NEXT_PUBLIC_SEM,
                    swap.lessonType,
                    [
                        ...requestedClasses.map(
                            (requestedClass) => requestedClass.wantedClassNo
                        ),
                        swap.classNo,
                    ],
                ],
            });

            if (!classData) {
                return res.status(400).json({
                    error: "Class data not found",
                    success: false,
                });
            }

            // group classData by classNo
            const groupedByClassNo = classData.reduce<GroupedByClassNo>(
                (r, a) => {
                    r[a.classNo] = [...(r[a.classNo] || []), a];
                    return r;
                },
                {}
            );

            res.status(200).json({
                success: true,
                data: {
                    swap,
                    groupedByClassNo,
                    requestedClassNos,
                },
            });
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
