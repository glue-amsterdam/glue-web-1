import type { AboutPageData } from "@/schemas/aboutPageSchema";
import AboutNavbar from "@/components/navbar/about-navbar";
import MainContainer from "@/components/main-container";
import AboutBlockRenderer from "./about-block-renderer";
import { config } from "@/config";
import BottomBlock from "@/components/bottom-block";

type Props = {
  data: AboutPageData;
};

const AboutPageView = ({ data }: Props) => {
  const hasNavbar = data.navbar.length > 0;

  return (
    <>
      {hasNavbar ? (
        <div className="fixed lg:top-(--nav-primary-h) top-(--nav-total-h-mobile) left-0 right-0 z-50 w-full hidden lg:block bg-(--background-color)">
          <MainContainer>
            <div className="border-b lg:border-b-2 border-(--black-color) py-[12px] flex items-center justify-start h-(--nav-secondary-h-mobile) lg:h-(--nav-secondary-h)">
              <AboutNavbar links={data.navbar} />
            </div>
          </MainContainer>
        </div>
      ) : null}
      <main id="about" className="pt-[122px]">
        <MainContainer>
          <h1 className="sr-only">About GLUE {config.cityName}</h1>
          <p className="sr-only">
            Meet the GLUE {config.cityName} team, learn about the GLUE Foundation,
            mission, press, and browse the GLUE archive by year.
          </p>
          {data.blocks.map((block) => (
            <AboutBlockRenderer key={block.id} block={block} />
          ))}
          <BottomBlock />
        </MainContainer>
      </main>
    </>
  );
};

export default AboutPageView;
