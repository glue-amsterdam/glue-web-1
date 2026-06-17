import OurPartners from "./partners-section/our-partners";
import BottomFooter from "./bottom-footer";
import { loadFooterAboutLinks } from "@/lib/about/load-about-page-data";
import { getCachedMainLinks } from "@/lib/main/get-main-links";

const BottomBlock = async () => {
  const [mainLinks, aboutLinks] = await Promise.all([
    getCachedMainLinks(),
    loadFooterAboutLinks(),
  ]);

  return (
    <div className="pb-[65px]">
      <OurPartners />
      <BottomFooter mainLinks={mainLinks} aboutLinks={aboutLinks} />
    </div>
  );
};

export default BottomBlock;
