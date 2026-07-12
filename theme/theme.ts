// 1. import `extendTheme` function
import {
  defineStyleConfig,
  extendTheme,
  withDefaultColorScheme,
  type ThemeConfig,
} from "@chakra-ui/react";
import { components } from "react-select";
import { Button } from "./components/button";

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

  components: {
    Button,
  },
});

export default extendTheme(
  theme
  // withDefaultColorScheme({ colorScheme: "purple" })
);
