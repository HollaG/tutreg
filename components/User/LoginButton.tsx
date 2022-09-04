import { useDispatch } from "react-redux";
import TelegramLoginButton, { TelegramUser } from "telegram-login-button";
import { sendPOST } from "../../lib/fetcher";
import { LoginResponse } from "../../pages/api/users/login";
import { miscActions } from "../../store/misc";
import { userActions } from "../../store/user";

const LoginButton = () => {
    const dispatch = useDispatch();
    const handleResponse = async (user: TelegramUser) => {
        console.log(user);

        const response: LoginResponse = await sendPOST("/api/users/login", user);
        dispatch(userActions.setUser(response.data));
        dispatch(miscActions.setNeedsLogIn(false))
    };

    return (
        <TelegramLoginButton botName="swaptutbot" dataOnauth={handleResponse} />
    );
};

export default LoginButton;
