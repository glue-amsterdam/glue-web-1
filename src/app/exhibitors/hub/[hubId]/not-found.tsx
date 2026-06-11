import type { Metadata } from "next";
import BigButton from "@/components/big-button";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";
import { config } from "@/config";

export const metadata: Metadata = {
  title: `GLUE ${config.cityName} | Hub not found`,
  description: `This exhibitor hub may no longer be available at GLUE ${config.cityName}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExhibitorHubNotFound() {
  return (
    <main id="exhibitor-hub-not-found-page" className="first-padding">
      <MainContainer>
        <section
          id="exhibitor-hub-not-found-section"
          className="flex flex-col gap-[15px] lg:gap-[30px]"
        >
          <HeadlineWCross title="Hub not found" />
          <p className="base-text-size">
            The hub you are looking for does not exist.
          </p>
          <BigButton
            as="link"
            label="see all the exhibitors"
            href="/exhibitors"
            mode="big"
          />
        </section>
      </MainContainer>
    </main>
  );
}
