import BigButton from "@/components/big-button";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";

const ExhibitorDeclined = () => {
  return (
    <main id="exhibitor-declined-page" className="first-padding">
      <MainContainer>
        <section
          id="exhibitor-declined-section"
          className="flex flex-col gap-[15px] lg:gap-[30px]"
        >
          <HeadlineWCross title="Participation declined" />
          <p className="base-text-size">
            This exhibitor participation request has been declined. If you
            believe this is an error, please contact the event organizers.
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

export default ExhibitorDeclined;
