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

         
            <FancyCard content="Select and rank your modules in the Order page. Then, copy the URL given by the website in 'Export link'." header="Step 1" src="tutorial/1.png"></FancyCard>
            <FancyCard content="Open the Select Tutorials / Labs popup on Edurec." header="Step 2" src="tutorial/2.png"></FancyCard>
            <FancyCard content="Open the extension, paste in the URL and click on 'Auto-select'. The extension will automatically select the modules for you. [This is a placeholder image]" header="Step 3" src="tutorial/3.png"></FancyCard>
            <FancyCard content="Then, open the Rank Tutorials / Labs popup and repeat step 3, but click on 'Auto-rank'. The extension will automatically select the modules for you. [This is a placeholder image]" header="Step 4" src="tutorial/3.png"></FancyCard>
               
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
