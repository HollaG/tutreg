// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import executeQuery from "../../../lib/db";

export type LoginResponse = { success: boolean; data: TelegramUser };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginResponse>
) {
    try {
        if (req.method === "POST") {
            const user = req.body as TelegramUser;

            // TODO: ensure authorized user
            // see: https://core.telegram.org/widgets/login

            // add user to database if not exists
            const userDB = await executeQuery({
                query: `SELECT * FROM users WHERE id = ?`,
                values: [user.id],
            });

            if (!user.username) user.username = "";
            if (!user.photo_url) user.photo_url = "";

            if (userDB.length) {
                // update
                const res = await executeQuery({
                    query: `UPDATE users SET ? WHERE id = ?`,
                    values: [user, user.id],
                });
                // console.log(res)
            } else {
                // insert
                const updatedUser = {
                    ...user,
                    can_notify: false
                }
                const results = await executeQuery({
                    query: `INSERT INTO users SET ?`,
                    values: [updatedUser],
                });
            }

            res.status(200).json({
                success: true,
                data: user,
            });
        }
    } catch (e) {
        console.log(e);
      
    }
}
