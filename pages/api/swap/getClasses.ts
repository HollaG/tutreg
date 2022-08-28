// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
import executeQuery from "../../../lib/db";
import { ClassDB } from "../../../types/db";

export type GetClassesResponse = {
    success: boolean,
    error?: string
    data?: GroupedByClassNo
};
export type GroupedByClassNo = {
    [classNo: string]: ClassDB[]
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GetClassesResponse>
) {
    if (req.method === "POST") {
        const { moduleCode, lessonType } = req.body;

        if (!moduleCode || !lessonType)
            return res.status(400).json({
                success: false,
                error: "Missing moduleCode or lessonType",
            });

        const values = [
            moduleCode,
            lessonType,
            process.env.NEXT_PUBLIC_AY,
            process.env.NEXT_PUBLIC_SEM,
        ]
        const classesData: ClassDB[] = await executeQuery({
            query: "SELECT * FROM classlist WHERE moduleCode = ? AND lessonType = ? AND ay = ? AND semester = ?",
            values
        });

        console.log(classesData)
        if (!classesData.length)
            return res.status(404).json({
                success: false,
                error: "No classes found",
            });

        // format into sorted by classNo
        
        const groupedByClassNo = classesData.reduce<GroupedByClassNo>((r, a) => {
            r[a.classNo] = [...(r[a.classNo] || []), a];
            return r;
        }, {});

        res.status(200).json({
            success: true,
            data: groupedByClassNo,
        })
    }
}
