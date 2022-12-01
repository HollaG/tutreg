import { ReactNode, useEffect, useState } from "react";
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

export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode();
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

                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            });
        }
    };

    const goBack = () => {
        router.back();
    };

    

    return (
        <>
            <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
                <Flex
                    h={16}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <Flex alignItems="center">
                        {router.pathname !== "/" && <IconButton
                            onClick={goBack}
                            variant="ghost"
                            // w={4}
                            // h={4}
                            p={0}
                            minW={8}
                            icon={<ChevronLeftIcon p={0} />}
                            aria-label="Go back"
                        />}

                        <NextLink passHref href={"/"}>
                            {/* <Link>ModRank 🔢</Link> */}
                            <Link>ModRank</Link>

                        </NextLink>
                    </Flex>

                    <Flex alignItems={"center"}>
                        <Stack direction={"row"} spacing={2}>
                            <Timer />
                            <Button onClick={toggleColorMode}>
                                {colorMode === "light" ? (
                                    <MoonIcon />
                                ) : (
                                    <SunIcon />
                                )}
                            </Button>

                            {user && (
                                <Button onClick={toggleNotification}>
                                    {miscState.notify ? (
                                        <MdNotificationsActive />
                                    ) : (
                                        <MdNotificationsOff />
                                    )}
                                </Button>
                            )}
                            <Menu isLazy>
                                <MenuButton
                                    as={Button}
                                    rounded={"full"}
                                    variant={"link"}
                                    cursor={"pointer"}
                                    minW={0}
                                >
                                    <Avatar
                                        size={"sm"}
                                        src={
                                            user
                                                ? user.photo_url
                                                : "/Telegram.svg"
                                        }
                                        name={user?.first_name}
                                    />
                                </MenuButton>
                                <MenuList alignItems={"center"}>
                                    {user ? (
                                        <>
                                            <br />
                                            <Center>
                                                <Avatar
                                                    size={"2xl"}
                                                    src={user.photo_url}
                                                    name={user.first_name}
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
                                        </>
                                    ) : (
                                        <Center>
                                            <LoginButton />
                                        </Center>
                                    )}
                                </MenuList>
                            </Menu>
                        </Stack>
                    </Flex>
                </Flex>
            </Box>
        </>
    );
}
