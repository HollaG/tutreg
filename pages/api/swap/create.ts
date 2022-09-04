// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../../lib/db";

type Data = {
    success: boolean,
    data?: any
    error?: string
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === "POST") {
        console.log(req.body);

        const {
            user,
            currentClassInfo: { moduleCode, lessonType, classNo },
            desiredClasses,
        } = req.body;

        if (!user || !moduleCode || !lessonType || !classNo || !desiredClasses) {
            return res.status(400).json({
                success: false,
                error: "Missing required info!"
            })
        }

        // ensure user exists in database
        const userDb = await executeQuery({
            query: "SELECT * FROM users WHERE id = ?",
            values: [user.id]
        })

        if (!userDb.length) {
            return res.status(400).json({
                success: false,
                error: "User does not exist in database!"
            })
        }
        // create swap
        const swapObj = {
            moduleCode,
            lessonType,
            classNo,
            from_t_id: user.id,
            status: "Open",
            to_t_id: "",
            ay: process.env.NEXT_PUBLIC_AY,
            semester: process.env.NEXT_PUBLIC_SEM,
            notified: true
        }

        const inserted = await executeQuery({
            query: `INSERT INTO swaps SET ?`,
            values: [swapObj]
        })
        const insertId = inserted.insertId;
        console.log(insertId)
        // insert into swaps_list
      
        for (const desiredClassNo of desiredClasses) {
            const result = await executeQuery({
                query: `INSERT INTO swaps_list (wantedClassNo, swapId) VALUES (?)`,
                values: [[desiredClassNo, insertId]]
            })
            console.log(result)
        }

        res.status(200).json({
            success: true
        })
    }

   
}
