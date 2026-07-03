import { sanitizeHtml } from "@/lib/sanitize-html";
import type { ArchiveBlock } from "@/schemas/aboutPageSchema";
import { ABOUT_ANCHORS } from "@/schemas/aboutPageSchema";
import ArchiveYearsList from "./archive-years-list";

type Props = {
  block: ArchiveBlock;
};

const ArchiveBlockView = ({ block }: Props) => {
  if (!block.is_visible) {
    return null;
  }

  const sanitizedDescription = sanitizeHtml(block.description);

  return (
    <section id={ABOUT_ANCHORS.ARCHIVE} aria-labelledby="archive-heading">
      <h2 id="archive-heading" className="title-text mini-padding">
        {block.title.toUpperCase()}
      </h2>
      {block.description ? (
        <div
          className="sr-only"
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
      ) : null}
      {block.years.length > 0 ? <ArchiveYearsList years={block.years} /> : null}
    </section>
  );
};

export default ArchiveBlockView;
