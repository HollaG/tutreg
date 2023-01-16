import {
    Badge,
    Button,
    Center,
    Flex,
    Heading,
    Image,
    Link,
    Stack,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export default function FancyCard({
    src,
    header,
    content,
    children,
}: {
    src?: string;
    header?: string;
    content?: string;
    children?: ReactNode;
}) {
    const color = useColorModeValue(
        "gray.700",
        "gray.400"
    )
    return (
        <Center py={6}>
            <Stack
                borderWidth="1px"
                borderRadius="lg"
                // w={{ sm: "100%", md: "540px" }}
                w="full"
                direction={{ base: "column", md: "row" }}
                // bg={useColorModeValue("white", "gray.900")}
                boxShadow={"2xl"}
                padding={4}
            >
                {children ? (
                    children
                ) : (
                    <>
                        <Flex flex={5}>
                            <Image
                                objectFit="contain"
                                boxSize="100%"
                                src={src}
                            />
                        </Flex>

                        <Stack
                            flex={1}
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            p={1}
                            pt={2}
                        >
                            <Heading fontSize={"2xl"} fontFamily={"body"}>
                                {header}
                            </Heading>

                            <Text
                                textAlign={"center"}
                                color={color}
                                px={3}
                            >
                                {content}
                            </Text>
                            {children}
                        </Stack>
                    </>
                )}
            </Stack>
        </Center>
    );
}
