// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import executeQuery from "../../../lib/db";
import { BasicResponse } from "../../../types/types";

interface NotificationData extends Omit<BasicResponse, "data"> {
    data?: boolean;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<NotificationData>
) {
    if (req.method === "POST") {
        const { id, hash } = req.body as { id: string; hash: string };

        // TODO: validate by Hash as well
        const user = await executeQuery({
            query: `SELECT can_notify FROM users WHERE id = ?`,
            values: [id],
        });
        if (!user)
            return res.status(400).json({
                error: "User not found!",
                success: false,
            });

        await executeQuery({
            query: `UPDATE users SET can_notify = ? WHERE id = ?`,
            values: [!user[0].can_notify, id],
        });

        return res.status(200).json({
            success: true,
            data: user[0] && !user[0].can_notify,
        });
    }
}
