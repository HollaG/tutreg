import { HStack, Avatar, Text, ChakraProps } from "@chakra-ui/react";
import { TelegramUser } from "telegram-login-button";

interface Props extends ChakraProps {
    children?: React.ReactNode|React.ReactNode[];
    user: TelegramUser
}

const UserDisplay: React.FC<Props> = ({ user, children }) => {
    return (
        <HStack>
            <Avatar size={"sm"} src={user.photo_url} name={user.first_name} />
            <Text>{user.first_name} {children}</Text>
        </HStack>
    );
};

export default UserDisplay
