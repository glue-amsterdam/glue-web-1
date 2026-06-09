import CmsTextSection from "@/components/cms/cms-text-section";
import Separator from "@/components/separator";
import type { NewsletterBlock } from "@/schemas/aboutPageSchema";

type Props = {
  block: NewsletterBlock;
};

const NewsletterBlockView = ({ block }: Props) => {
  if (!block.is_visible) {
    return null;
  }

  return (
    <>
      <CmsTextSection slug="newsletter" />
      <Separator />
    </>
  );
};

export default NewsletterBlockView;
