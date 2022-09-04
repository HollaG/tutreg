import { Dispatch } from "@reduxjs/toolkit";
import { TelegramUser } from "telegram-login-button";
import { RequestSwapResponseData } from "../pages/api/swap/request";
import { miscActions } from "../store/misc";
import { sendPOST } from "./fetcher";

export const requestSwapHelper = async (
    dispatch: Dispatch,
    swapId: number,
    user: TelegramUser | null,
    type: "request"|"remove"
) => {
    try {
        if (!user) {
            // user not signed in, prompt the modal!

            dispatch(miscActions.setNeedsLogIn(true));
            return;
        }

        // send a POST request to server to add this person's id to the swap request
        // return an error if this person has already requested for this slot
        const response: RequestSwapResponseData = await sendPOST(
            "/api/swap/request",
            {
                swapId: swapId,
                userId: user.id, // this is pretty scary - a user can just change the userId in the request and request for someone else's slot
                hash: user.hash, // send the hash so that we can compare to the hash in the database so the hacker needs to know both someone else's hash and someone else's id
                type: type,
            }
        );

        // return response

        

        return response
    } catch (e) {
        throw e;
    }
};
