// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import executeQuery from "../../../lib/db";
import {
    BasicResponse,
    ClassSwapRequest,
    ClassSwapRequestDB,
} from "../../../types/types";

export interface RequestSwapResponseData extends Omit<BasicResponse, "data"> {
    data?: any;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RequestSwapResponseData>
) {
    try {
        if (req.method === "POST") {
            const { swapId, userId, type, hash } = req.body;

            // ensure userId and hash match
            const user: TelegramUser[] = await executeQuery({
                query: `SELECT * FROM users WHERE id = ? AND hash = ?`,
                values: [userId, hash],
            });

        

            if (!user[0]) {
                return res.status(401).json({
                    error: "Not authorized",
                    success: false,
                });
            }

            // get the swap
            const swap: ClassSwapRequestDB[] = await executeQuery({
                query: `SELECT * FROM swaps WHERE swapId = ?`,
                values: [swapId],
            });

            if (!swap[0])
                return res.status(400).json({
                    success: false,
                    error: "Swap not found!",
                });
            if (type === "request") {
                // add userId to request
                if (swap[0].requestors.includes(userId)) {
                    // already requested, return error
                    return res.status(400).json({
                        success: false,
                        error: "You have already requested this swap!",
                    });
                } else {
                    // add userId to requested
                    const requestors = [
                        ...swap[0].requestors.split(","),
                        userId,
                    ].join(",");
                    await executeQuery({
                        query: `UPDATE swaps SET requestors = ?, notified = false WHERE swapId = ?`,
                        values: [requestors, swapId],
                    });

                    // Send a message to the owner
                    return res.status(200).json({
                        success: true,
                        data: requestors
                    });
                }
            } else {
                // remove userId from request
                if (!swap[0].requestors.includes(userId)) {
                    // already not requested, return error
                    return res.status(400).json({
                        success: false,
                        error: "You have not requested this swap!",
                    });
                }
                const oldRequestors = swap[0].requestors.split(",");

                const newRequestors = oldRequestors.filter(
                    (id) => id !== userId.toString()
                );

                console.log(newRequestors)
                await executeQuery({
                    query: `UPDATE swaps SET requestors = ?, notified = false WHERE swapId = ?`,
                    values: [newRequestors.join(","), swapId],
                });
                return res.status(200).json({
                    success: true,
                    data: newRequestors.join(",")
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
}
