// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../../lib/db";
import { ModuleWithClassDB } from "../../../types/db";
import { ClassSwapFor, ClassSwapRequest } from "../../../types/types";
import { GetSwapClassesData, getSwapData } from "./[swapId]";

export type SwapData = {
    openSwaps: GetSwapClassesData[];
    // requestedClasses: GroupedBySwapId,
    // classData: ModuleWithClassDB[];
    // selfSwaps: GetSwapClassesData[];
};

export type GetSwapDataResponse = {
    success: boolean;
    data?: SwapData;
    error?: string;
};

// export type GroupedBySwapId = {
//     [swapId: string]: ClassSwapFor[]
// }

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetSwapDataResponse>
) {
    if (req.method === "GET") {
        // get the open requests that are of the correct AY and sem

        const swaps: ClassSwapRequest[] = await executeQuery({
            // requested property not present
            query: `SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE ay = ? AND semester = ? AND status = 'Open' ORDER BY swaps.status DESC, swaps.createdAt DESC`,
            values: [process.env.NEXT_PUBLIC_AY, process.env.NEXT_PUBLIC_SEM],
        });

        if (!swaps.length) {
            return res.status(200).json({
                success: true,
                data: {
                    openSwaps: [],
                    // requestedClasses: {},
                    // classData: [],
                    // selfSwaps: [],
                },
            });
        }

        const promisedSwapData = swaps.map((swap) =>
            getSwapData(swap.swapId, swap)
        );
        try {
            const swapData = await Promise.all(promisedSwapData);

            return res.status(200).json({
                success: true,
                data: {
                    openSwaps: swapData,
                },
            });
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    }
}
