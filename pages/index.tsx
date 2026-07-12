import {
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import CallToAction from "../components/Home/CTA";
import CallToActionWithVideo from "../components/Home/CTA_ext";
import { ContainedPage } from "../components/PageWrap/ContainedPage";



const Home: NextPage = () => {
  return <ContainedPage><CallToAction /><CallToActionWithVideo /></ContainedPage>
  // return (
  //     <Stack spacing={5} alignItems="center" h="100%">
  //         <NextLink href="/order">
  //             <Button width="100%" height="16rem">
  //                 Click here for Tutorial ranking
  //             </Button>
  //         </NextLink>
  //         <NextLink href="/swap">
  //             <Button width="100%" height="16rem">
  //                 Click here for Tutorial swaps
  //             </Button>
  //         </NextLink>
  //     </Stack>
  // );
};

export default Home;
