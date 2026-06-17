"use client";

import BigButton from "@/components/big-button";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";

export default function ExhibitorHubError() {
  return (
    <main id="exhibitor-hub-error-page" className="first-padding">
      <MainContainer>
        <section
          id="exhibitor-hub-error-section"
          className="flex flex-col gap-[15px] lg:gap-[30px]"
        >
          <HeadlineWCross title="Hub data not found" />
          <p className="base-text-size">
            The hub data you are looking for could not be loaded.
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
