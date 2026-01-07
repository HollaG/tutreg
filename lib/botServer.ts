import { SendMessageRequest, UserEvent } from "../types/botServer";

/**
 * Sends a message to the bot server to notify a user of an event.
 *
 * Note: this function is not meant to be awaited. It does not matter if it fails.
 *
 * @param eventType
 * @param t_id
 * @param swap_id
 * @param name
 */
export const sendTelegramAlert = async (
  eventType: UserEvent,
  t_id: number,
  swap_id: number,
  name: string
) => {
  try {
    const telegramRes = await fetch(
      `http://localhost:${process.env.BOT_SERVER_PORT}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: eventType,
          t_id,
          name,
          swap_id,
        } as SendMessageRequest),
      }
    );
  } catch (e) {
    console.error("Error sending alert to bot server:", e);
  }
};
