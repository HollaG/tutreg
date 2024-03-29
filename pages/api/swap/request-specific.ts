// for requesting a swap with a specific class
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { NextApiRequest, NextApiResponse } from "next";
import { TelegramUser } from "telegram-login-button";
import {
    COLLECTION_NAME,
    fireDb,
    SwapReplies,
    signIn,
    SwapReplyRequest,
} from "../../../firebase";
import executeQuery, { db } from "../../../lib/db";
import { LessonType } from "../../../types/modules";
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
            const { swapId, userId, hash, moduleCode, classNo, lessonType } =
                req.body as {
                    userId: string; // of the user who wants to request a swap with the creator
                    hash: string;

                    swapId: string;
                    moduleCode: string;
                    classNo: string;
                    lessonType: LessonType;
                };

            const signedIn = await signIn();
            if (!signedIn) {
                return res.status(500).json({
                    error: "Failed to sign in to Firebase",
                    success: false,
                });
            }
            // ensure userId and hash match
            // TODO: find a better way
            // problem: if user logins on desktop, a hash is saved.
            // if user logins on mobile, a different hash is saved.
            // that means that if user logins on desktop, then on mobile, the hash will be different
            // perhaps we can store an array of hashess?
            const user: TelegramUser[] = await executeQuery({
                query: `SELECT * FROM users WHERE id = ?`,
                values: [userId],
            });

            if (!user[0]) {
                return res.status(401).json({
                    error: "Missing user in database!",
                    success: false,
                });
            }

            // get the swap
            const swap: ClassSwapRequestDB[] = await executeQuery({
                query: `SELECT * FROM swaps WHERE swapId = ?`,
                values: [swapId],
            });

            // add this swap to the list of swaps he's requested

            const requestIndexDocRef = doc(
                fireDb,
                REQUEST_INDEX_COLLECTION_NAME,
                userId.toString()
            );
            const requestIndexDoc = await getDoc(requestIndexDocRef);
            if (!requestIndexDoc.exists()) {
                // doc doesn't exist yet, this doc has no requests, so we add it
                await setDoc(requestIndexDocRef, {
                    requests: [swapId.toString()],
                });
            } else {
                // not yet
                const oldRequests = requestIndexDoc.data().requests as string[];
                await setDoc(requestIndexDocRef, {
                    requests: [...new Set([...oldRequests, swapId.toString()])],
                });
            }

            // Try to get the document from the database
            // note: the id HAS to be a string
            // https://stackoverflow.com/questions/66615533/typeerror-u-indexof-is-not-a-function-for-reactjs-and-firebase
            const docRef = doc(fireDb, COLLECTION_NAME, swapId.toString());
            const docDb = await getDoc(docRef);

            if (!docDb.exists()) {
                // doc doesn't exist yet, this doc has no requests, so we add it
                await setDoc(docRef, {
                    swapId: swapId,
                    requests: [
                        {
                            lastUpdated: new Date(),
                            requested: {
                                classNo: classNo,
                                status: "new",
                                lessonType: lessonType,
                                moduleCode: moduleCode,
                            },
                            requestorName: user[0].first_name,
                            requestorId: Number(userId),
                        },
                    ],
                });

                res.status(200).json({
                    success: true,
                    data: "Your request has been sent!",
                });
            } else {
                // not yet

                const oldRequests = docDb.data().requests as SwapReplyRequest[];

                // check if this user has made a request before
                const userPrevRequest = oldRequests.find((request) => {
                    return request.requestorId === Number(userId);
                });

                if (!userPrevRequest) {
                    // this user has never made one
                    await setDoc(docRef, {
                        requests: [
                            ...oldRequests,
                            {
                                lastUpdated: new Date(),
                                requested: {
                                    classNo: classNo,
                                    status: "new",
                                    lessonType: lessonType,
                                    moduleCode: moduleCode,
                                },
                                requestorName: user[0].first_name,
                                requestorId: Number(userId),
                            },
                        ],
                    });
                    res.status(200).json({
                        success: true,
                        data: "Your request has been sent!",
                    });
                } else {
                    // this user has requested something before
                    // check if this user's request is the same (aka he clicked the button twice, lol)
                    const isSame =
                        userPrevRequest.requested.classNo === classNo &&
                        userPrevRequest.requested.lessonType === lessonType &&
                        userPrevRequest.requested.moduleCode === moduleCode;
                    if (isSame) {
                        return res.status(405).json({
                            success: false,
                            error: "You have already requested for this swap! Please wait for them to contact you.",
                        });
                    }

                    // todo: do we allow users to change their request?
                    // if we don't, uncomment the following code
                    return res.status(405).json({
                        success: false,
                        error: "You have already requested for a swap! Please wait for them to contact you.",
                    });

                    const newRequests = oldRequests.map((request) => {
                        if (request.requestorId === Number(userId)) {
                            // this user's requests
                            return {
                                ...request,
                                lastUpdated: new Date(),
                                requested:
                                    // ...request.requested,
                                    {
                                        classNo: classNo,
                                        status: "new",
                                        lessonType: lessonType,
                                        moduleCode: moduleCode,
                                    },
                            };
                        } else {
                            return request;
                        }
                    });

                    await setDoc(docRef, {
                        ...docDb.data(),
                        requests: newRequests,
                    });
                    res.status(200).json({
                        success: true,
                        data: "Your request has been changed!",
                    });
                }

                // const newRequests = oldRequests.map((request) => {
                //     if (request.requestorId === Number(userId)) {
                //         //
                //     }
                // })
            }
        }
    } catch (e) {
        console.log(e);
    }
}

export const REQUEST_INDEX_COLLECTION_NAME =
    process.env.NEXT_PUBLIC_REQUEST_INDEX_COLLECTION_NAME || "requestIndex";
