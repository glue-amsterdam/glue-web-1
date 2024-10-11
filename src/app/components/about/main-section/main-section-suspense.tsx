import { fetchMainSectionContent } from "@/utils/api";
import MainSection from "./main-section";
import { Suspense } from "react";
import CenteredLoader from "../../loader";

async function Main() {
  const mainSection = await fetchMainSectionContent();
  return <MainSection content={mainSection} />;
}

export default function MainSectionSuspense() {
  return (
    <Suspense fallback={<CenteredLoader />}>
      <Main />
    </Suspense>
  );
}
