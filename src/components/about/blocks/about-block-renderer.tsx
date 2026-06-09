import { ABOUT_BLOCK_IDS, type AboutBlock } from "@/schemas/aboutPageSchema";
import ArchiveBlockView from "./archive-block";
import FaqBlockView from "./faq-block";
import NewsletterBlockView from "./newsletter-block";
import TeamBlock from "./team-block";
import TextDualBlockView from "./text-dual-block";
import Separator from "@/components/separator";

type Props = {
  block: AboutBlock;
};

const AboutBlockRenderer = ({ block }: Props) => {
  switch (block.id) {
    case ABOUT_BLOCK_IDS.TEAM:
      return <TeamBlock block={block} />;
    case ABOUT_BLOCK_IDS.FOUNDATION:
      return <><Separator /><TextDualBlockView block={block} flex={true} maxWidth={"723px"} /></>;
    case ABOUT_BLOCK_IDS.MISSION:
      return <><Separator /><TextDualBlockView block={block} grid={true} /></>;
    case ABOUT_BLOCK_IDS.PRESS:
      return <TextDualBlockView block={block} grid={true} />;
    case ABOUT_BLOCK_IDS.NEWSLETTER:
      return <NewsletterBlockView block={block} />;
    case ABOUT_BLOCK_IDS.ARCHIVE:
      return <ArchiveBlockView block={block} />;
    case ABOUT_BLOCK_IDS.FAQ:
      return <><Separator /><FaqBlockView block={block} /></>;
    default:
      return null;
  }
};

export default AboutBlockRenderer;
