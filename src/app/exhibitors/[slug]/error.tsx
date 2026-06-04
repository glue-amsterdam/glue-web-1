"use client";


import BigButton from "@/components/big-button";
import BottomBlock from "@/components/bottom-block";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";


export default function ExhibitorError() {
  return (
    <main id="exhibitor-error-page" className="first-padding">
      <MainContainer>
        <section id="exhibitor-error-section" className="flex flex-col gap-[15px] lg:gap-[30px]">
          <HeadlineWCross title="Exhibitor data not found" />
          <p className="base-text-size">The exhibitor data you are looking for does not exist.</p>
          <BigButton as="link" label="see all the exhibitors" href="/exhibitors" mode="big" />
        </section>
        <BottomBlock /></MainContainer>
    </main>
  );
}
