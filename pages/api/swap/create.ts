// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import executeQuery from "../../../lib/db";
import { LessonType } from "../../../types/modules";
import { FullInfo } from "../../swap/create";
import { SendMessageRequest, UserEvent } from "../../../types/botServer";
import { sendTelegramAlert } from "../../../lib/botServer";

type Data = {
  success: boolean;
  data?: string;
  error?: string;
};

type RequestBody = {
  user: TelegramUser | null;
  currentClassInfo: FullInfo;
  desiredClasses: FullInfo[];
  comments?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const {
      user,
      currentClassInfo: { moduleCode, lessonType, classNo },
      desiredClasses,
      comments,
    } = req.body as RequestBody;

    if (!user || !moduleCode || !lessonType || !classNo || !desiredClasses) {
      return res.status(400).json({
        success: false,
        error: "Missing required info!",
      });
    }

    // ensure user exists in database
    const userDb = await executeQuery({
      query: "SELECT * FROM users WHERE id = ?",
      values: [user.id],
    });

    if (!userDb.length) {
      return res.status(400).json({
        success: false,
        error: "User does not exist in database!",
      });
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
      notified: true,
      comments: comments || "",
    };

    const inserted = await executeQuery({
      query: `INSERT INTO swaps SET ?`,
      values: [swapObj],
    });
    const insertId = inserted.insertId;
    // insert into swaps_list
    for (const desiredClass of desiredClasses) {
      const {
        moduleCode: desiredModuleCode,
        lessonType: desiredLessonType,
        classNo: desiredClassNo,
      } = desiredClass;
      const result = await executeQuery({
        query: `INSERT INTO swaps_list (wantedModuleCode, wantedLessonType, wantedClassNo, swapId) VALUES (?)`,
        values: [
          [desiredModuleCode, desiredLessonType, desiredClassNo, insertId],
        ],
      });
    }

    // send a Telegram message
    // Warning: This couples the two services together.
    sendTelegramAlert(
      UserEvent.SWAP_CREATED,
      user.id,
      insertId,
      user.first_name
    );

    res.status(200).json({
      success: true,
      data: insertId,
    });
  }
}
