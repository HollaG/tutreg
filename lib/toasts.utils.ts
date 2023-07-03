import { UseToastOptions } from "@chakra-ui/react";

export const ERROR_TOAST_OPTIONS: UseToastOptions = {
    status: "error",

    duration: 7000,
    isClosable: true,
};

export const SUCCESS_TOAST_OPTIONS: UseToastOptions = {
    status: "success",
    duration: 3000,
    isClosable: true,
};
