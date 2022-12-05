import { useToast } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import TelegramLoginButton, { TelegramUser } from "telegram-login-button";
import { sendPOST } from "../../lib/fetcher";
import { LoginResponse } from "../../pages/api/users/login";
import { miscActions } from "../../store/misc";
import { userActions } from "../../store/user";
const botName = process.env.NEXT_PUBLIC_BOT_NAME;
const LoginButton = () => {
    const dispatch = useDispatch();
    const toast = useToast()
    const handleResponse = async (user: TelegramUser) => {
        console.log(user);

        const response: LoginResponse = await sendPOST(
            "/api/users/login",
            user
        );

        
        if (response.success && response.data) {
            dispatch(userActions.setUser(response.data));
            dispatch(miscActions.setNeedsLogIn(false));
        } else {
            toast({
                colorScheme: "red",
                title: "Error",
                description: response.error,
            })
        }
    };

    return (
        <TelegramLoginButton botName={botName} dataOnauth={handleResponse} />
    );
};

export default LoginButton;
