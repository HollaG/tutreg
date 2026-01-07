import { ReactNode, useEffect, useRef, useState } from "react";
import {
    Box,
    Flex,
    Avatar,
    Link,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Stack,
    useColorMode,
    Center,
    IconButton,
    useToast,
    Container,
    Heading,
} from "@chakra-ui/react";
import { ChevronLeftIcon, MoonIcon, SunIcon, TimeIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types/types";
import { TelegramUser } from "telegram-login-button";
import { userActions } from "../store/user";
import LoginButton from "./User/LoginButton";

import Telegram from "../public/Telegram.png";
import Timer from "./Timer";

import { MdNotificationsActive, MdNotificationsOff } from "react-icons/md";
import { sendPOST } from "../lib/fetcher";
import { miscActions } from "../store/misc";
import NextLink from "next/link";
import { useRouter } from "next/router";
import UserAvatar from "./User/UserAvatar";
import useKeyPress from "../hooks/useKeyPress";
import Mousetrap from "mousetrap";
import { StringifyOptions } from "querystring";
import { classesActions } from "../store/classesReducer";
import { SUCCESS_TOAST_OPTIONS } from "../lib/toasts.utils";
const NavLink = ({ children }: { children: ReactNode }) => (
    <Link
        px={2}
        py={1}
        rounded={"md"}
        _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
        }}
        href={"#"}
    >
        {children}
    </Link>
);

type Shortcut = string | string[];
export type Keybind = {
    key: string;
    description: string;
};
const shortcuts = [
    {
        key: "x",
        description: "Toggle night mode",
    },
    {
        key: "r",
        description: "Go to rank page",
    },
    { key: "c", description: "Go to swap classes page" },
    { key: "e", description: "Go to extension page" },
    { key: "s", description: "Go to settings page" },
    { key: "n", description: "Toggle notifications" },
];
export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode();

    // I appreciate NUSMods for giving the code for this section.
    // Code located in: src/views/components/KeyboardShortcuts.tsx
    const shortcuts = useRef<Keybind[]>([]);
    useEffect(() => {
        function bind(
            key: string,
            description: string,
            action: (e: Event) => void
        ) {
            shortcuts.current.push({ key, description });
            Mousetrap.bind(key, action);
        }

        bind("x", "Toggle night mode", () => toggleColorMode());
        bind("o", "Go to order page", () => router.push("/order"));
        bind("r", "Go to order page", () => router.push("/order"));
        bind("s", "Go to swap classes page", () => router.push("/swap"));
        bind("e", "Go to extension page", () => router.push("/extension"));
        bind("q", "Go to settings page", () => router.push("/settings"));
        bind("n", "Toggle notifications", () => {
            toggleNotification();
        });
        bind("c", "Go to create swap page", () => router.push("/swap/create"));
        return () => {
            shortcuts.current.forEach(({ key }) => Mousetrap.unbind(key));
            shortcuts.current = [];
        };
    });

    // const xPressed = useKeyPress("x");
    // useEffect(() => {
    //     if (xPressed) toggleColorMode();
    // }, [xPressed, toggleColorMode]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const toast = useToast();
    // Handle user
    const userState = useSelector((state: RootState) => state.user);
    const miscState = useSelector((state: RootState) => state.misc);

    const [user, setUser] = useState<TelegramUser | null>();
    useEffect(() => {
        if (userState) setUser(userState);
        else setUser(null);
    }, [userState]);

    const dispatch = useDispatch();
    const logoutHandler = () => {
        dispatch(userActions.logout());
    };

    // load user's notification settings
    useEffect(() => {
        if (user) {
            // load user's notification settings
            sendPOST("/api/users/getNotificationSettings", {
                id: user.id,
            }).then((res) => {
                dispatch(miscActions.updateNotificationStatus(res.data));
            });
        }
    }, [user, dispatch]);

    const toggleNotification = () => {
        if (user) {
            sendPOST("/api/users/toggleNotification", {
                id: user.id,
                hash: user.hash,
            }).then((res) => {
                dispatch(miscActions.updateNotificationStatus(res.data));
                toast({
                    title: `Notifications ${res.data ? "enabled" : "disabled"}`,

                    ...SUCCESS_TOAST_OPTIONS,
                });
            });
        }
    };

    const goBack = () => {
        router.back();
    };

    // reset the user's selections if they are visiting for the first time since a new academic year
    const misc = useSelector((state: RootState) => state.misc);
    useEffect(() => {
        if (
            misc.notifications &&
            misc.notifications.changedTo2023S1 === false
        ) {
            dispatch(miscActions.setAcadYearNotificationDismissed());
            dispatch(classesActions.removeAll());
        }
    }, [misc.notifications]);

    return (
        <Box
            bg={useColorModeValue("blue.50", "gray.900")}
            w="100%"
            boxShadow="rgba(0, 0, 0, 0.1) 0px 4px 13px -3px"
        >
            <Container maxW="container.lg">
                <Flex
                    h={16}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <Flex
                        alignItems="center"
                        justifyContent={"space-between"}
                        width="54px"
                    >
                        <Center>
                            <IconButton
                                visibility={
                                    router.pathname === "/"
                                        ? "hidden"
                                        : "visible"
                                }
                                onClick={goBack}
                                variant="ghost"
                                // w={4}
                                // h={4}
                                p={0}
                                minW={8}
                                icon={<ChevronLeftIcon p={0} />}
                                aria-label="Go back"
                            />
                        </Center>
                        <NextLink passHref href={"/"}>
                            {/* <Link>ModRank 🔢</Link> */}
                            <Link>
                                <Heading fontSize="lg" lineHeight={"40px"}>
                                    TutReg
                                </Heading>
                            </Link>
                        </NextLink>
                    </Flex>

                    <Flex alignItems={"center"}>
                        <Stack direction={"row"} spacing={{ base: 0, md: 2 }}>
                            {/* <Timer /> */}
                            <Button onClick={toggleColorMode} variant="ghost">
                                {colorMode === "light" ? (
                                    <MoonIcon />
                                ) : (
                                    <SunIcon />
                                )}
                            </Button>

                            {user && (
                                <Button
                                    onClick={toggleNotification}
                                    variant="ghost"
                                >
                                    {miscState.notify ? (
                                        <MdNotificationsActive />
                                    ) : (
                                        <MdNotificationsOff />
                                    )}
                                </Button>
                            )}
                            {!user ? <LoginButton /> : null}
                            {user ? <Menu isLazy>
                                <MenuButton
                                    as={Button}
                                    rounded={"full"}
                                    // variant={"link"}
                                    cursor={"pointer"}
                                    minW={0}
                                    variant="ghost"
                                >
                                    {/* <Avatar
                                        size={"sm"}
                                        src={
                                            user
                                                // ? user.photo_url
                                                ? undefined
                                                : "/Telegram.svg"
                                        }
                                        name={user?.first_name}
                                    /> */}
                                    <UserAvatar user={user} />
                                </MenuButton>
                                <MenuList alignItems={"center"}>

                                    <br />
                                    <Center>
                                        <UserAvatar
                                            user={user}
                                            size="2xl"
                                        />
                                    </Center>
                                    <br />
                                    <Center>
                                        <p>{user.first_name}</p>
                                    </Center>
                                    <Center>
                                        <p>@{user.username}</p>
                                    </Center>
                                    <br />
                                    <MenuDivider />
                                    <MenuItem
                                        onClick={() => logoutHandler()}
                                    >
                                        Logout
                                    </MenuItem>

                                </MenuList>
                            </Menu> : null}
                        </Stack>
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}
