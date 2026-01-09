import { NextPage } from "next";
import FeaturesTemplate from "../components/FeaturesTemplate";
import { ContainedPage } from "../components/PageWrap/ContainedPage";

const Features: NextPage = () => {
  return (
    <ContainedPage><FeaturesTemplate /></ContainedPage>
  );
};
export default Features;
