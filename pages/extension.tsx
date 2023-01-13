import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    calc,
    Center,
    Container,
    Heading,
    Image,
    Link,
    Stack,
    Text,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Card from "../components/Card/Card";
import FancyCard from "../components/Card/FancyCard";
import FullWidth from "../components/Containers/FullWidth";

const Extension: NextPage = () => {
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

            <FancyCard>
                {" "}
                <Stack spacing={5}>
                    <Box
                        as="video"
                        controls
                        src="tutorial/video_main.mp4"
                        // poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217"
                        // alt="Big Buck Bunny"
                        objectFit="contain"
                        sx={{
                            aspectRatio: "959/516",
                        }}
                    />
                    <Heading fontSize="2xl" textAlign="center"> Watch the video tutorial, or read below for a pictorial guide.</Heading> 
                </Stack>
            </FancyCard>
            <FancyCard
                content="Select and rank your modules in the Order Classes page. Then, copy the URL given by the website in 'Export link'."
                header="Step 1"
                src="tutorial/1.png"
            ></FancyCard>
            <FancyCard
                content="Open the Select Tutorials / Labs popup on Edurec."
                header="Step 2"
                src="tutorial/2.png"
            ></FancyCard>
            <FancyCard
                content="Open the extension, paste in the URL and click on 'Auto-select'. The extension will automatically select the modules for you."
                header="Step 3"
                src="tutorial/3.png"
            ></FancyCard>
            <FancyCard
                content="You should see a success message. Close the popup and go to step 5. If you see an error, try clicking the button again. If it persists, contact the developer at https://t.me/+sbR6NJfo7axkNWE1"
                header="Step 4"
                src="tutorial/4.png"
            ></FancyCard>
            <FancyCard
                content="Open the Rank Tutorials / Labs popup on Edurec."
                header="Step 5"
                src="tutorial/5.png"
            ></FancyCard>
            <FancyCard
                content="Open the extension, paste in the URL again and click on 'Auto-rank'. The extension will automatically rank the modules for you."
                header="Step 6"
                src="tutorial/6.png"
            ></FancyCard>
            <FancyCard
                content="You should see a success message. Close the popup check that your classes are in the correct order If you see an error, try clicking the button again. If it persists, contact the developer at https://t.me/+sbR6NJfo7axkNWE1"
                header="Step 7"
                src="tutorial/7.png"
            ></FancyCard>
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
