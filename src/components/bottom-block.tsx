import OurPartners from "./partners-section/our-partners";
import BottomFooter from "./bottom-footer";
import { getCachedMainLinks } from "@/lib/main/get-main-links";

const BottomBlock = async () => {
  const mainLinks = await getCachedMainLinks();

  return (
    <div className="pb-[65px]">
      <OurPartners />
      <BottomFooter mainLinks={mainLinks} />
    </div>
  );
};

export default BottomBlock;
