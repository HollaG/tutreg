// 1. import `extendTheme` function
import {
    extendTheme,
    withDefaultColorScheme,
    type ThemeConfig,
} from "@chakra-ui/react";

// 2. Add your color mode config
const config: ThemeConfig = {
    initialColorMode: "system",
    useSystemColorMode: true,
};

// 3. extend the theme
const theme = extendTheme({
    config,

    fonts: {
        heading: `'Lexend', sans-serif`,
        body: `'Inter', sans-serif`,
    },
});

export default extendTheme(
    theme
    // withDefaultColorScheme({ colorScheme: "purple" })
);
