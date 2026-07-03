import type { Metadata } from "next";
import BigButton from "@/components/big-button";
import MainContainer from "@/components/main-container";
import { config } from "@/config";

export const metadata: Metadata = {
  title: `GLUE ${config.cityName} | Archive year not found`,
  description: `This archive year may no longer be available at GLUE ${config.cityName}.`,
  robots: {
    index: false,
    follow: false,
  },
};

const ArchiveYearNotFound = () => {
  return (
    <main id="archive-year-not-found" className="pt-(--nav-total-h)">
      <MainContainer className="pt-[120px] text-(--black-color)">
        <h1 className="base-text-size">Archive year not found</h1>
        <p className="pt-[20px] base-text-size">
          This archive year may no longer be available.
        </p>
        <div className="pt-[30px]">
          <BigButton
            as="link"
            href="/about#archive"
            label="back to archive"
            mode="big"
          />
        </div>
      </MainContainer>
    </main>
  );
};

export default ArchiveYearNotFound;
