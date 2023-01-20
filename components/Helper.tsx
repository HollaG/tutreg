import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { classesActions } from "../store/classesReducer";

const Helper = () => {
    const router = useRouter();

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(classesActions.removeChangedClasses());
    }, [router.pathname, dispatch]);
    return <></>;
};

export default Helper;
