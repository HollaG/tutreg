import { TelegramUser } from "telegram-login-button";

export const requestComm = (user: TelegramUser, username: string, moduleCode: string, lessonType: string, classNo: string) => {
    // check if user is authenticated, if not, return status 0
    if (!user) return 0
    // check if user has requested in past 30seconds, if so, return 1
    
    // send request, return 2
}