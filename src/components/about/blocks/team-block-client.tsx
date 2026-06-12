"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AccordionPlusCrossIcon from "@/components/icons/accordion-plus-cross-icon";
import { cn } from "@/lib/utils";
import { ABOUT_ANCHORS, type TeamBlock, type TeamMember } from "@/schemas/aboutPageSchema";
import AboutBlockImage from "./about-block-image";

type SanitizedTeamContent = {
  description: string;
  memberDescriptions: string[];
};

type Props = {
  block: TeamBlock;
  sanitized: SanitizedTeamContent;
};

type TeamAccordionIconAlign = "start" | "center";

const TEAM_ACCORDION_ICON_ALIGN: TeamAccordionIconAlign = "start";

const getMemberId = (member: TeamMember, index: number) =>
  `team-member-${index}-${(member.email || member.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const TeamMemberContent = ({
  member,
  sanitizedDescription,
}: {
  member: TeamMember;
  sanitizedDescription: string;
}) => (
  <div className="base-text-size space-y-3">
    {(member.email || member.phone) && (
      <address className="not-italic space-y-1">
        {member.email ? (
          <a
            href={`mailto:${member.email.trim()}`}
            aria-label={`Email ${member.name}`}
          >
            {member.email}
          </a>
        ) : null}
        {member.phone ? (
          <a
            href={`tel:${member.phone.replace(/\s/g, "")}`}
            aria-label={`Phone ${member.name}`}
          >
            {member.phone}
          </a>
        ) : null}
      </address>
    )}
    {member.description ? (
      <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
    ) : null}
  </div>
);

type TeamMemberTriggerProps = {
  member: TeamMember;
  memberId: string;
  iconAlign: TeamAccordionIconAlign;
};

const TeamMemberTrigger = ({ member, memberId, iconAlign }: TeamMemberTriggerProps) => {
  const name = member.name.trim();
  const role = member.role.trim();

  return (
    <AccordionTrigger
      hideIcon
      className="group w-full base-text-size main-boder-top text-left hover:no-underline py-[15px]"
    >
      <div className="flex w-full flex-1 flex-col">
        <div
          className={cn(
            "flex w-full justify-between gap-3",
            iconAlign === "center" ? "items-center" : "items-start"
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col text-left base-text-size">
            <span id={`${memberId}-name`}>{name.toUpperCase()}</span>
            <span>{role}</span>
          </div>
          <AccordionPlusCrossIcon />
        </div>
      </div>
    </AccordionTrigger>
  );
};

const TeamBlockClient = ({ block, sanitized }: Props) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  if (!block.is_visible) {
    return null;
  }

  return (
    <section id={ABOUT_ANCHORS.TEAM} aria-labelledby="team-heading">
      <h2 id="team-heading" className="title-text lg:pt-(--nav-secondary-h)">
        {block.title.toUpperCase()}
      </h2>
      {block.description ? (
        <div
          className="sr-only"
          dangerouslySetInnerHTML={{ __html: sanitized.description }}
        />
      ) : null}
      <div className="pt-[40px] lg:pt-[60px] max-w-[1045px] mx-auto">
        <AboutBlockImage
          src={block.media.image.src}
          alt={block.media.image.alt}
          fallbackAlt={block.title}
          className="pt-[40px]"
        />
        <Accordion
          type="multiple"
          className="w-full pt-[40px] lg:pt-[60px] lg:grid lg:grid-cols-2 lg:gap-x-[30px] lg:gap-y-[100px]"
          aria-label={block.title}
          value={openIds}
          onValueChange={setOpenIds}
        >
          {block.members.map((member, index) => {
            const memberId = getMemberId(member, index);

            return (
              <AccordionItem key={memberId} value={memberId} className="border-b-0">
                <TeamMemberTrigger
                  member={member}
                  memberId={memberId}
                  iconAlign={TEAM_ACCORDION_ICON_ALIGN}
                />
                <AccordionContent aria-labelledby={`${memberId}-name`}>
                  <TeamMemberContent
                    member={member}
                    sanitizedDescription={sanitized.memberDescriptions[index] ?? ""}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
};

export default TeamBlockClient;
