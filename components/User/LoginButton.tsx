import { useToast } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import TelegramLoginButton, { TelegramUser } from "telegram-login-button";
import { sendPOST } from "../../lib/fetcher";
import { ERROR_TOAST_OPTIONS } from "../../lib/toasts.utils";
import { LoginResponse } from "../../pages/api/users/login";
import { miscActions } from "../../store/misc";
import { userActions } from "../../store/user";
const botName = process.env.NEXT_PUBLIC_BOT_NAME;
const LoginButton = () => {
    const dispatch = useDispatch();
    const toast = useToast();
    const handleResponse = async (user: TelegramUser) => {
        const response: LoginResponse = await sendPOST(
            "/api/users/login",
            user
        );

        if (response.success && response.data) {
            dispatch(userActions.setUser(response.data));
            dispatch(miscActions.setNeedsLogIn(false));
        } else {
            toast({
                title: "Error",
                description: response.error,
                ...ERROR_TOAST_OPTIONS,
            });
        }
    };

    return (
        <TelegramLoginButton
            usePic
            botName={botName}
            dataOnauth={handleResponse}
        />
    );
};

export default LoginButton;
