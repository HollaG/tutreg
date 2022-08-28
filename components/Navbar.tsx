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
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types/types";
import { TelegramUser } from "telegram-login-button";
import { userActions } from "../store/user";
import LoginButton from "./User/LoginButton";

import Telegram from '../public/Telegram.png'

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

    // Handle user
    const userState = useSelector((state: RootState) => state.user);

    const [user, setUser] = useState<TelegramUser | null>();
    useEffect(() => {
        if (userState) setUser(userState);
        else setUser(null);
    }, [userState]);

    const dispatch = useDispatch();
    const logoutHandler = () => {
        dispatch(userActions.logout());
    };

    return (
        <>
            <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
                <Flex
                    h={16}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                >
                    <Box>ModRank 🔢</Box>

                    <Flex alignItems={"center"}>
                        <Stack direction={"row"} spacing={7}>
                            <Button onClick={toggleColorMode}>
                                {colorMode === "light" ? (
                                    <MoonIcon />
                                ) : (
                                    <SunIcon />
                                )}
                            </Button>

                            <Menu>
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
                                            user ? user.photo_url : "/Telegram.svg"
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
