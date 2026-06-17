import { sanitizeHtml } from "@/lib/sanitize-html";
import type { TeamBlock } from "@/schemas/aboutPageSchema";
import TeamBlockClient from "./team-block-client";

type Props = {
  block: TeamBlock;
};

const TeamBlock = ({ block }: Props) => {
  const sanitized = {
    description: sanitizeHtml(block.description),
    memberDescriptions: block.members.map((member) =>
      sanitizeHtml(member.description ?? "")
    ),
  };

  return <TeamBlockClient block={block} sanitized={sanitized} />;
};

export default TeamBlock;
