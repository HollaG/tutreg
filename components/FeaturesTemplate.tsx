import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Icon,
    Text,
    Stack,
    HStack,
    VStack,
    StackDivider,
    Image,
    Center,
    Button,
    createIcon,
    useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import Head from "next/head";
import NextLink from "next/link";

// Replace test data with your own
const featuresGeneral = [
    {
        id: 1,
        title: "Night mode!",
        text: "Tired of staring at a bright screen? Switch to night mode!",
    },
    {
        id: 2,
        title: "Share data across devices!",
        text: "Sign in with Telegram to share your data across devices!",
    },
    {
        id: 3,
        title: "Fully open-source",
        text: "This website is fully open-source, and you can view the code on GitHub!",
    },
];
const featuresRank = [
    {
        id: 1,
        title: "No sign-in needed!",
        text: "This feature does not require signing-in",
    },
    {
        id: 2,
        title: "Import from NUSMods",
        text: "Using NUSMods' share function, import your classes directly into tutreg.com",
    },
    {
        id: 3,
        title: "Auto-hide non-biddable",
        text: "Non biddable classes (e.g. lectures) are automatically hidden",
    },
    {
        id: 4,
        title: "Add more classes and courses",
        text: "Search for and manually add substitute classes and courses",
    },
    {
        id: 5,
        title: "Rank by priority",
        text: "Using a drag-and-drop interface, rank your courses and classes by priority",
    },
    {
        id: 6,
        title: "Auto generate final ranking",
        text: "The ideal ranking will be generated for you!",
    },
    {
        id: 7,
        title: "Import your ranking to other devices",
        text: "Import your ranking by loading the URL provided, or by signing in with Telegram.",
    },
];

const featuresSwap = [
    {
        id: 1,
        title: "Telegram sign-in required to request swaps",
        text: "This website uses Telegram to track and update you on your swaps.",
    },
    {
        id: 1,
        title: "Create swap requests",
        text: "Create swap requests for your courses and classes.",
    },
    {
        id: 2,
        title: "View swap requests",
        text: "Search for swaps created by other users",
    },
    {
        id: 3,
        title: "Automatic Telegram notifications",
        text: "When someone requests your swap, you will be notified automatically through Telegram",
    },
    {
        id: 4,
        title: "Privacy guaranteed",
        text: "Nobody will see your Telegram username unless you request a swap",
    },
];

const featuresExt = [
    {
        id: 1,
        title: "Auto-select classes",
        text: "Automatically select classes in the Select Tutorials/Labs popup",
    },
    {
        id: 2,
        title: "Auto-rank classes",
        text: "Automatically rank classes in the Rank Tutorials/Labs popup",
    },
    {
        id: 3,
        title: "Expand the popup's height",
        text: "Increase the vertical height of the popup so you can see better!",
    },
];

const Arrow = createIcon({
    displayName: "Arrow",
    viewBox: "0 0 72 24",
    path: (
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
            fill="currentColor"
        />
    ),
});

const CTAButton: React.FC<{
    text: string;
    link: string;
    label: string;
}> = ({ text, link, label }) => {
    return (
        <Center>
            <Stack
                direction={"column"}
                spacing={3}
                align={"center"}
                alignSelf={"center"}
                position={"relative"}
            >
                <Button
                    colorScheme={"green"}
                    bg={"green.400"}
                    rounded={"full"}
                    px={6}
                    _hover={{
                        bg: "green.500",
                    }}
                >
                    <NextLink href={link}>{text}</NextLink>
                </Button>
                <Box>
                    <Icon
                        as={Arrow}
                        color={useColorModeValue("gray.800", "gray.300")}
                        w={71}
                        position={"absolute"}
                        right={-71}
                        top={"10px"}
                    />
                    <Text
                        fontSize={"lg"}
                        fontFamily={"Caveat"}
                        position={"absolute"}
                        right={"-125px"}
                        top={"-15px"}
                        transform={"rotate(10deg)"}
                    >
                        {label}
                    </Text>
                </Box>
            </Stack>
        </Center>
    );
};

export default function FeaturesTemplate() {
    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Box p={4}>
                <Stack
                    spacing={6}
                    as={Container}
                    maxW={"3xl"}
                    textAlign={"center"}
                >
                    <Heading fontSize={"3xl"}>tutreg.com</Heading>
                    <Text color={"gray.600"} fontSize={"xl"}>
                        Your tutorial registration helper
                    </Text>
                    <CTAButton
                        label="No sign in needed!"
                        link="/"
                        text="Get started!"
                    />
                </Stack>

                <Stack divider={<StackDivider />} spacing={10} mt={10}>
                    <Container maxW={"6xl"}>
                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {featuresGeneral.map((feature) => (
                                <HStack key={feature.id} align={"top"}>
                                    <Box color={"green.400"} px={2}>
                                        <Icon as={CheckIcon} />
                                    </Box>
                                    <VStack align={"start"}>
                                        <Text fontWeight={600}>
                                            {feature.title}
                                        </Text>
                                        <Text color={"gray.400"}>
                                            {feature.text}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Container>
                    <Container maxW={"6xl"}>
                        <Center mb={2}>
                            <Image
                                alt={"Logo of extension"}
                                fit={"cover"}
                                align={"center"}
                                // w={"128px"}
                                maxH={"128px"}
                                src={"icons/icon.png"}
                            />
                        </Center>
                        <Text
                            fontFamily={"heading"}
                            fontWeight={700}
                            textTransform={"uppercase"}
                            mb={3}
                            fontSize={"xl"}
                            color={"gray.500"}
                            textAlign="center"
                        >
                            Rank your classes
                        </Text>

                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {featuresRank.map((feature) => (
                                <HStack key={feature.id} align={"top"}>
                                    <Box color={"green.400"} px={2}>
                                        <Icon as={CheckIcon} />
                                    </Box>
                                    <VStack align={"start"}>
                                        <Text fontWeight={600}>
                                            {feature.title}
                                        </Text>
                                        <Text color={"gray.400"}>
                                            {feature.text}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Container>
                    <Container maxW={"6xl"}>
                        <Center mb={2}>
                            <Image
                                alt={"Logo of extension"}
                                fit={"cover"}
                                align={"center"}
                                // w={"128px"}
                                maxH={"128px"}
                                src={"icons/swap.png"}
                            />
                        </Center>
                        <Text
                            fontFamily={"heading"}
                            fontWeight={700}
                            textTransform={"uppercase"}
                            mb={3}
                            fontSize={"xl"}
                            color={"gray.500"}
                            textAlign="center"
                        >
                            Swap your classes
                        </Text>

                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {featuresSwap.map((feature) => (
                                <HStack key={feature.id} align={"top"}>
                                    <Box color={"green.400"} px={2}>
                                        <Icon as={CheckIcon} />
                                    </Box>
                                    <VStack align={"start"}>
                                        <Text fontWeight={600}>
                                            {feature.title}
                                        </Text>
                                        <Text color={"gray.400"}>
                                            {feature.text}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Container>
                    <Container maxW={"6xl"}>
                        <Center mb={2}>
                            <Image
                                alt={"Logo of extension"}
                                fit={"contain"}
                                align={"center"}
                                // w={"128px"}
                                maxH={"128px"}
                                src={"icons/chromeext.png"}
                            />
                        </Center>
                        <Text
                            fontFamily={"heading"}
                            fontWeight={700}
                            textTransform={"uppercase"}
                            mb={3}
                            fontSize={"xl"}
                            color={"gray.500"}
                            textAlign="center"
                        >
                            Import into ModReg
                        </Text>
                        <SimpleGrid
                            columns={{ base: 1, md: 2, lg: 3 }}
                            spacing={10}
                        >
                            {featuresExt.map((feature) => (
                                <HStack key={feature.id} align={"top"}>
                                    <Box color={"green.400"} px={2}>
                                        <Icon as={CheckIcon} />
                                    </Box>
                                    <VStack align={"start"}>
                                        <Text fontWeight={600}>
                                            {feature.title}
                                        </Text>
                                        <Text color={"gray.400"}>
                                            {feature.text}
                                        </Text>
                                    </VStack>
                                </HStack>
                            ))}
                        </SimpleGrid>
                    </Container>
                </Stack>
            </Box>
        </>
    );
}
