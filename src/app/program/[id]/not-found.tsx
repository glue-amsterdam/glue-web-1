import BigButton from "@/components/big-button";
import MainContainer from "@/components/main-container";

const ProgramEventNotFound = () => {
  return (
    <main id="program-not-found" className="pt-(--nav-total-h)">
      <MainContainer className="pt-[120px] text-(--black-color)">
        <h1 className="base-text-size">Event not found</h1>
        <p className="pt-[20px] base-text-size">
          This program event may no longer be available.
        </p>
        <div className="pt-[30px]">
          <BigButton as="link" href="/program" label="back to program" mode="big" />
        </div>
      </MainContainer>
    </main>
  );
};

export default ProgramEventNotFound;
