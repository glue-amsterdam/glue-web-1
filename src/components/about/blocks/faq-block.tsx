import { sanitizeHtml } from "@/lib/sanitize-html";
import type { FaqBlock } from "@/schemas/aboutPageSchema";
import FaqBlockClient from "./faq-block-client";

type Props = {
  block: FaqBlock;
};

const FaqBlockView = ({ block }: Props) => {
  const sanitized = {
    description: sanitizeHtml(block.description),
    answers: block.items.map((item) => sanitizeHtml(item.answer)),
  };

  return <FaqBlockClient block={block} sanitized={sanitized} />;
};

export default FaqBlockView;
