import { sanitizeHtml } from "@/lib/sanitize-html";
import type { ArchiveBlock } from "@/schemas/aboutPageSchema";
import ArchiveBlockClient from "./archive-block-client";

type Props = {
  block: ArchiveBlock;
};

const ArchiveBlockView = ({ block }: Props) => {
  const preloadedSections = block.preloaded_sections ?? [];
  const initialSectionsByYear = Object.fromEntries(
    preloadedSections.map((section) => [section.year, section])
  );
  const sanitizedSectionDescriptions = Object.fromEntries(
    preloadedSections.map((section) => [
      section.year,
      sanitizeHtml(section.text_block.description),
    ])
  );

  return (
    <ArchiveBlockClient
      block={block}
      sanitizedDescription={sanitizeHtml(block.description)}
      initialSectionsByYear={initialSectionsByYear}
      sanitizedSectionDescriptions={sanitizedSectionDescriptions}
    />
  );
};

export default ArchiveBlockView;
