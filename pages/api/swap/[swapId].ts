// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import {
  COLLECTION_NAME,
  fireDb,
  signIn,
  SwapReplies,
} from "../../../firebase";
import executeQuery from "../../../lib/db";
import { ClassDB, ModuleWithClassDB } from "../../../types/db";
import {
  ClassOverview,
  ClassSwapFor,
  ClassSwapRequest,
} from "../../../types/types";
import { convertToTimetableList, FullInfo, HalfInfo } from "../../swap/create";
import { sendTelegramAlert } from "../../../lib/botServer";
import { UserEvent } from "../../../types/botServer";

export type SpecificSwapResponseData = {
  error?: string;
  success: boolean;
  data?: GetSwapClassesData | TelegramUser[];
};

export type GetSwapClassesData = {
  drawnClasses: ClassOverview[];
  swap: ClassSwapRequest;
  currentClassInfo: FullInfo;
  desiredClasses: FullInfo[];
  desiredModules: HalfInfo[];
  isInternalSwap: boolean; // true when the moduleCode and lessonType are the same, and there is only one desired moduleCode/LessonType combi
};
type GroupedByClassNo = {
  [classNo: string]: ModuleWithClassDB[];
};

/**
 * Gets the swap data (with formatted classes for timetables etc) from a swap request
 *
 * @param swapId
 * @param _swap
 * @returns
 */
export const getSwapData = async (
  swapId: number,
  _swap?: ClassSwapRequest
): Promise<GetSwapClassesData> => {
  let swap = _swap;
  if (!swap) {
    const swapDb: ClassSwapRequest[] = await executeQuery({
      query:
        "SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE swapId = ?",
      values: [swapId],
    });

    // error handling
    if (!swapDb.length)
      throw {
        error: "Swap not found",
        success: false,
        status: 404,
      };

    swap = swapDb[0];
  }

  // 2) get the requested classes
  const requestedClassesDb: ClassSwapFor[] = await executeQuery({
    query: `SELECT * FROM swaps_list WHERE swapId IN (?)`,
    values: [swap.swapId],
  });

  const desiredClasses = requestedClassesDb.map((requestedClass) => ({
    moduleCode: requestedClass.wantedModuleCode,
    lessonType: requestedClass.wantedLessonType,
    classNo: requestedClass.wantedClassNo,
  })) as FullInfo[];

  // for every moduleCode and lessonType in both the current class and the desired classes, get the list of available classes
  // TODO: see if we can optimize this by doing a single query using the `IN` operator
  const moduleCodeLessonTypes = [
    {
      moduleCode: swap.moduleCode,
      lessonType: swap.lessonType,
      classNo: swap.classNo,
    },
    ...desiredClasses,
  ];

  const drawnClasses: ClassOverview[] = [];

  const uniqueDesiredModules = new Set<string>();
  for (const moduleCodeLessonType of moduleCodeLessonTypes) {
    // only add it to desiredModules if it's not the class that they have
    if (
      !(
        moduleCodeLessonType.moduleCode === swap.moduleCode &&
        moduleCodeLessonType.lessonType === swap.lessonType &&
        moduleCodeLessonType.classNo === swap.classNo
      )
    ) {
      uniqueDesiredModules.add(
        `${moduleCodeLessonType.moduleCode}: ${moduleCodeLessonType.lessonType}`
      );
    }
    const { moduleCode, lessonType, classNo } = moduleCodeLessonType;

    const possiblyDrawnClassesForThisModule: ModuleWithClassDB[] =
      await executeQuery({
        query: `SELECT * FROM classlist LEFT JOIN modulelist ON classlist.moduleCode = modulelist.moduleCode WHERE classlist.moduleCode = ? AND classlist.lessonType = ? AND classlist.classNo = ? AND ay = ? AND semester = ?`,
        values: [moduleCode, lessonType, classNo, swap.ay, swap.semester],
      });

    // might be more than 1: see linked classes.
    // group them by classNumber
    const groupedByClassNo: GroupedByClassNo = {
      [classNo]: possiblyDrawnClassesForThisModule,
    };

    // convert to a timetable format

    const drawnClassesForThis = convertToTimetableList(groupedByClassNo);

    if (drawnClassesForThis.length) {
      drawnClasses.push(...drawnClassesForThis);
    }
  }

  if (!drawnClasses.length) {
    throw {
      error: "Class data not found",
      success: false,
      status: 404,
    };
  }

  const desiredModules = [...uniqueDesiredModules].map((m) => ({
    moduleCode: m.split(":")[0].trim(),
    lessonType: m.split(":")[1].trim(),
  })) as HalfInfo[];

  // return this data to the client
  const data = {
    drawnClasses,
    swap,

    currentClassInfo: {
      moduleCode: swap.moduleCode,
      lessonType: swap.lessonType,
      classNo: swap.classNo,
    } as FullInfo,

    desiredClasses,
    desiredModules,
    isInternalSwap:
      desiredModules.length === 1 &&
      desiredModules[0].moduleCode === swap.moduleCode &&
      desiredModules[0].lessonType === swap.lessonType,
  };

  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SpecificSwapResponseData>
) {
  const { swapId } = req.query as { swapId: string };
  try {
    if (req.method === "GET") {
      try {
        const data = await getSwapData(Number(swapId?.toString()));

        res.status(200).json({
          success: true,
          data: data,
        });
      } catch (e) {
        console.log(e);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      }
    }

    if (req.method === "POST") {
      const user = req.body;
      if (!swapId)
        return res.status(404).json({
          success: false,
          error: "Missing swap ID!",
        });
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

      // query to firebase
      await signIn();

      const docRef = doc(fireDb, COLLECTION_NAME, swapId.toString());
      const data = await getDoc(docRef);

      // if (!data.exists()) {
      //     return res.status(404).json({
      //         success: false,
      //         error: "Swap not found!",
      //     });
      // }

      // instead of returning 404, return that there are no users.
      if (!data.exists()) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const docData = data.data() as SwapReplies;
      const requests = docData.requests;

      const userIds = requests.map((req) => req.requestorId);

      // db request to get the swap
      // const swapDb: ClassSwapRequest[] = await executeQuery({
      //     query: "SELECT * FROM swaps LEFT JOIN users ON swaps.from_t_id = users.id WHERE swapId = ?",
      //     values: [swapId],
      // });

      // // find all users whose ID is in requestors, if any
      // const requestorString = swapDb[0].requestors.trim();
      // // remove empty elements
      // const requestors = requestorString.split(",").filter((x) => x);

      const users: TelegramUser[] = await executeQuery({
        query: `SELECT * FROM users WHERE id IN (?)`,
        values: [userIds],
      });

      // remove other's hash and auth date
      let cleanedUsers = users.map((user) => {
        const copiedUser = { ...user };
        copiedUser.hash = "";
        copiedUser.auth_date = 0;
        // copiedUser.id = 0

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

      // get all the requests for this swap (on firebase)
      const docRef = doc(fireDb, COLLECTION_NAME, swapId.toString());
      const data = await getDoc(docRef);

      // for each request, notify the user that the swap has been completed
      if (data.exists()) {
        const docData = data.data() as SwapReplies;
        const requests = docData.requests;
        for (const req of requests) {
          sendTelegramAlert(
            UserEvent.SWAP_REQUESTED_COMPLETED,
            req.requestorId,
            Number(swapId),
            req.requestorName
          );
        }
      }

      // send a notification to the swap creator as well
      sendTelegramAlert(
        UserEvent.SWAP_CREATED_COMPLETED,
        user.id,
        Number(swapId),
        user.first_name
      );

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
