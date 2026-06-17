import type { Metadata } from "next";
import BigButton from "@/components/big-button";
import BottomBlock from "@/components/bottom-block";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";
import { config } from "@/config";

export const metadata: Metadata = {
  title: `GLUE ${config.cityName} | Exhibitor not found`,
  description: `This exhibitor may no longer be available at GLUE ${config.cityName}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ParticipantNotFound() {
  return (
    <main id="participant-not-found-page" className="first-padding">
      <MainContainer>
        <section id="participant-not-found-section" className="flex flex-col gap-[15px] lg:gap-[30px]">
          <HeadlineWCross title="Participant not found" />
          <p className="base-text-size">The participant you are looking for does not exist.</p>
          <BigButton as="link" label="see all the exhibitors" href="/exhibitors" mode="big" />
        </section>
        <BottomBlock />
      </MainContainer>
    </main>
  );
}
