import BigButton from "@/components/big-button";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";

const ExhibitorPending = () => {
  return (
    <main id="exhibitor-pending-page" className="first-padding">
      <MainContainer>
        <section
          id="exhibitor-pending-section"
          className="flex flex-col gap-[15px] lg:gap-[30px]"
        >
          <HeadlineWCross title="Pending approval" />
          <p className="base-text-size">
            This exhibitor page is not yet accessible. A moderator will confirm
            participation soon.
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
};

export default ExhibitorPending;
