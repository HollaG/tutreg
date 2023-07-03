import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
    AspectRatio,
    Box,
    Button,
    calc,
    Center,
    Container,
    Heading,
    Image,
    Link,
    Stack,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    Text,
    useSteps,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Card from "../components/Card/Card";
import FancyCard from "../components/Card/FancyCard";
import FullWidth from "../components/Containers/FullWidth";
import NextImage from "next/image";
const Extension: NextPage = () => {
    const { activeStep } = useSteps({
        index: -1,
        count: 7,
    });

    return (
        <Stack>
            <Center>
                <Image
                    alt={"Logo of extension"}
                    fit={"cover"}
                    align={"center"}
                    w={"256px"}
                    h={"256px"}
                    src={"icons/icon.png"}
                />
            </Center>
            <Heading fontSize="3xl" textAlign={"center"} fontWeight="semibold">
                {" "}
                Tutreg Companion Extension{" "}
            </Heading>
            <Center>
                <Button
                    leftIcon={
                        <ExternalLinkIcon h={4} w={4} color={"gray.300"} />
                    }
                    colorScheme="orange"
                >
                    {" "}
                    <Link
                        isExternal
                        href="https://chrome.google.com/webstore/detail/tutreg-companion-extensio/alklihigfndbjjihbglpfpadlmkcgdja?hl=en&authuser=0"
                    >
                        Chrome Webstore
                    </Link>
                </Button>
                <Button
                    ml={2}
                    leftIcon={
                        <ExternalLinkIcon h={4} w={4} color={"gray.300"} />
                    }
                    colorScheme="blue"
                >
                    {" "}
                    <Link
                        isExternal
                        href="https://www.howtogeek.com/411830/how-to-install-google-chrome-extensions-in-microsoft-edge/"
                    >
                        Install on Edge
                    </Link>
                </Button>
            </Center>
            <Stack spacing={5}>
                {/* <Box
                    as="video"
                    controls
                    src="tutorial/video_main.mp4"
                    // poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217"
                    // alt="Big Buck Bunny"
                    objectFit="contain"
                    sx={{
                        aspectRatio: "959/516",
                    }}
                /> */}

                <AspectRatio ratio={16 / 9}>
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/NCb4QdqYO88"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </AspectRatio>
                <Heading fontSize="2xl" textAlign="center">
                    {" "}
                    Watch the video tutorial, or read below for a pictorial
                    guide.
                </Heading>
            </Stack>
            <Stepper index={activeStep} orientation="vertical">
                <Box w="100%">
                    <Step>
                        <StepIndicator>
                            <StepStatus
                                complete={<StepIcon />}
                                incomplete={<StepNumber />}
                                active={<StepNumber />}
                            />
                        </StepIndicator>

                        <Box>
                            <StepTitle>
                                Select and rank your courses in the Rank Classes
                                page. Then, copy the URL given by the website in
                                'Export link'.
                            </StepTitle>
                            <StepDescription></StepDescription>

                            <Image
                                mt={3}
                                objectFit="contain"
                                w="full"
                                src={"tutorial/1.png"}
                            />
                        </Box>

                        <StepSeparator />
                    </Step>
                </Box>
                <Step>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                        />
                    </StepIndicator>

                    <Box>
                        <StepTitle>
                            Open the Select Tutorials / Labs popup on Edurec.
                        </StepTitle>
                        <StepDescription></StepDescription>
                        <Image
                            mt={3}
                            objectFit="contain"
                            w="full"
                            src={"tutorial/2.png"}
                        />
                    </Box>

                    <StepSeparator />
                </Step>
                <Step>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                        />
                    </StepIndicator>

                    <Box>
                        <StepTitle>
                            Open the extension, paste in the URL and click on
                            'Auto-select'. The extension will automatically
                            select the courses for you.
                        </StepTitle>
                        <StepDescription></StepDescription>
                        <Image
                            mt={3}
                            objectFit="contain"
                            w="full"
                            src={"tutorial/3.png"}
                        />
                    </Box>

                    <StepSeparator />
                </Step>
                <Step>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                        />
                    </StepIndicator>

                    <Box>
                        <StepTitle>
                            You should see a success message. Close the popup
                            and go to step 5. If you see an error, try clicking
                            the button again. If it persists, contact the
                            developer at{" "}
                            <Link isExternal href="https://t.me/tutreghelp">
                                {" "}
                                https://t.me/tutreghelp
                            </Link>
                        </StepTitle>
                        <StepDescription></StepDescription>
                        <Image
                            mt={3}
                            objectFit="contain"
                            w="full"
                            src={"tutorial/4.png"}
                        />
                    </Box>

                    <StepSeparator />
                </Step>
                <Step>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                        />
                    </StepIndicator>

                    <Box>
                        <StepTitle>
                            Open the Rank Tutorials / Labs popup on Edurec.
                        </StepTitle>
                        <StepDescription></StepDescription>
                        <Image
                            mt={3}
                            objectFit="contain"
                            w="full"
                            src={"tutorial/5.png"}
                        />
                    </Box>

                    <StepSeparator />
                </Step>
                <Step>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                        />
                    </StepIndicator>

                    <Box>
                        <StepTitle>
                            Open the extension, paste in the URL again and click
                            on 'Auto-rank'. The extension will automatically
                            rank the courses for you.
                        </StepTitle>
                        <StepDescription></StepDescription>
                        <Image
                            mt={3}
                            objectFit="contain"
                            w="full"
                            src={"tutorial/6.png"}
                        />
                    </Box>

                    <StepSeparator />
                </Step>
                <Step>
                    <StepIndicator>
                        <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                        />
                    </StepIndicator>

                    <Box>
                        <StepTitle>
                            You should see a success message. Close the popup
                            check that your classes are in the correct order If
                            you see an error, try clicking the button again. If
                            it persists, contact the developer at{" "}
                            <Link isExternal href="https://t.me/tutreghelp">
                                {" "}
                                https://t.me/tutreghelp
                            </Link>
                        </StepTitle>
                        <StepDescription></StepDescription>
                        <Image
                            mt={3}
                            objectFit="contain"
                            w="full"
                            src={"tutorial/7.png"}
                        />
                    </Box>

                    <StepSeparator />
                </Step>
            </Stepper>
        </Stack>
    );
};

// Step 1: Select and rank your modules on tutreg.com/order.
// Step 2: Copy the URL given by the website.
// Step 3: Open the "Select Tutorials / Labs popup on Edurec"
// Step 4: Open the extension, paste in the URL and click on 'Auto-select'. The extension will automatically select the modules for you.
// Step 5: Close the "Select Tutorials / Labs popup" and open the 'Rank Tutorials/Labs' popup.
// Step 6: Open the extension, paste in the URL again and click on 'Auto-rank'. The extension will automatically rank the modules for you.

export default Extension;
