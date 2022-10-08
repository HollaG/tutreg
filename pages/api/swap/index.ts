// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../../lib/db";
import { ModuleWithClassDB } from "../../../types/db";
import { ClassSwapFor, ClassSwapRequest } from "../../../types/types";

export type SwapData ={
    openSwaps: ClassSwapRequest[],
    requestedClasses: GroupedBySwapId,
    classData: ModuleWithClassDB[],
    selfSwaps: ClassSwapRequest[],
}

export type GetSwapDataResponse = {
    success: boolean,
    data?: SwapData,
    error?: string
};

export type GroupedBySwapId = {
    [swapId: string]: ClassSwapFor[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetSwapDataResponse>
) {
    if (req.method === "GET") {
        // get the open requests that are of the correct AY and sem and NOT yours
        console.log([process.env.NEXT_PUBLIC_AY, process.env.NEXT_PUBLIC_SEM])
        const openSwaps: ClassSwapRequest[] = await executeQuery({
            query: `SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE ay = ? AND semester = ? AND status = 'Open' OR status = "Completed"`,
            values: [process.env.NEXT_PUBLIC_AY, process.env.NEXT_PUBLIC_SEM]
        })

        console.log({openSwaps})

        if (!openSwaps.length) {
            return res.status(200).json({
                success: true,
                data: {
                    openSwaps: [],
                    requestedClasses: {},
                    classData: [],
                    selfSwaps: []
                }
            })
        }
        // for every module in openSwaps, get all the class data
        const classData: ModuleWithClassDB[] = await executeQuery({
            query: `SELECT * FROM classlist LEFT JOIN modulelist ON classlist.moduleCode = modulelist.moduleCode WHERE classlist.moduleCode IN (?) AND ay = ? AND semester = ? AND classlist.lessonType IN (?)`,
            values: [[...new Set(openSwaps.map(swap => swap.moduleCode))], process.env.NEXT_PUBLIC_AY, process.env.NEXT_PUBLIC_SEM, [...new Set(openSwaps.map(swap => swap.lessonType))]]
        })



        // console.log(openSwaps)
        // get the requested classes
        const requestedClasses: ClassSwapFor[] = await executeQuery({
            query: `SELECT * FROM swaps_list WHERE swapId IN (?)`,
            values: [openSwaps.map(swap => swap.swapId)]
        })

     

        const groupedBySwapId = (requestedClasses || []).reduce<GroupedBySwapId>((r, a) => {
            r[a.swapId] = [...(r[a.swapId] || []), a];
            return r;
        }, {});

        // discard openSwaps which don't have any requestedClasses
        // remove sensitive data
        const filteredOpenSwaps = openSwaps.filter(swap => groupedBySwapId[swap.swapId]).map((swap) => {
            const newSwap = {...swap}
            newSwap.hash = ""
            newSwap.auth_date = 0
            return newSwap
        })

        res.status(200).json({
            success: true,
            data: {
                openSwaps: filteredOpenSwaps,
                requestedClasses: groupedBySwapId,
                classData,
                selfSwaps: []
            }
        })
        
    }
  
}
