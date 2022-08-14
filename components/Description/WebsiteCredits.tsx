import { Link, Stack, Text } from "@chakra-ui/react"

const WebsiteCredits = () => {
    return <Stack spacing={3}>
        <Text>
                This website was made by{" "}
                <Link isExternal href="https://marcussoh.com" textDecoration="underline">
                    {/* <Highlight
                        query={"Marcus Soh"}
                        styles={{ px: "1", py: "1", bg: "blue.100" }}
                    > */}
                        Marcus Soh
                    {/* </Highlight> */}
                </Link>
                , and is open-source. View the{" "}
                <Link isExternal href="https://github.com/HollaG/tutreg" textDecoration="underline">
                    GitHub Repository
                </Link>{" "}
            </Text>
            <Text>Data sourced from <Link isExternal href="https://nusmods.com" textDecoration="underline">NUSMods.com</Link>. Thank you!</Text> 
    </Stack>
}

export default WebsiteCredits