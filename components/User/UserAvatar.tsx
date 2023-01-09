import { Avatar } from "@chakra-ui/react";
import { TelegramUser } from "telegram-login-button";

const UserAvatar: React.FC<{
    user: TelegramUser | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
}> = ({ user, size = "sm" }) => {
    return (
        <Avatar
            size={size}
            src={
                user
                    ? // ? user.photo_url
                      undefined
                    : "/Telegram.svg"
            }
            name={user?.first_name}
        />
    );
};

export default UserAvatar;
