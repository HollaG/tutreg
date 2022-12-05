// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import executeQuery from "../../../lib/db";

import { createHash, createHmac } from "crypto";

export type LoginResponse = {
    success: boolean;
    data?: TelegramUser;
    error?: string;
};

const bot_token = process.env.BOT_TOKEN;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginResponse>
) {
    try {
        if (req.method === "POST") {
            const user = req.body as TelegramUser;

            // Ensure only authorized users can login
            // see: https://core.telegram.org/widgets/login
            // implementation: https://edisonchee.com/writing/telegram-login-with-node.js/
            // note: https://stackoverflow.com/questions/71299151/telegram-bot-login-checking-authorization-not-equal-hash

          
            const secretKey = createHash("SHA256")
                .update(bot_token || "")
                .digest();
            const dataCheckString = Object.keys(user)
                .filter(e => e !== "hash")
                .sort()
                .map((key) => `${key}=${user[key as keyof TelegramUser]}`)
                .join("\n");

            const hmac = createHmac("sha256", secretKey)
                .update(dataCheckString)
                .digest("hex");

            if (hmac !== user.hash) {
                return res.status(401).json({
                    success: false,
                    error: "Invalid data!",
                });
            }

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
                    can_notify: true, // default to true? 
                };
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
