import { sanitizeHtml } from "@/lib/sanitize-html";
import type { TextDualBlock } from "@/schemas/aboutPageSchema";
import TextDualBlockClient from "./text-dual-block-client";

type Props = {
  block: TextDualBlock;
  flex?: boolean;
  grid?: boolean;
  maxWidth?: string;
};

const TextDualBlockView = ({ block, flex, grid, maxWidth }: Props) => {
  const sanitized = {
    description: sanitizeHtml(block.description),
    textBlock1: sanitizeHtml(block.text_block_1),
    textBlock2: sanitizeHtml(block.text_block_2),
  };

  return (
    <TextDualBlockClient
      block={block}
      sanitized={sanitized}
      flex={flex}
      grid={grid}
      maxWidth={maxWidth}
    />
  );
};

export default TextDualBlockView;
