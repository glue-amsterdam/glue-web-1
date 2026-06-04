"use client";

import ExhibitorCard from "@/components/exhibitors/exhibitor-card";
import ExhibitorDescription from "@/components/exhibitors/exhibitor-description";
import ExhibitorImagesCarousel from "@/components/exhibitors/exhibitor-images-carousel";
import HeadlineWCross from "@/components/headline-w-cross";
import RoundedNumber from "@/components/rounded-number";
import type { ExhibitorHubDetail } from "@/lib/participants/exhibitor-detail-types";
import {
  getExhibitorMapHref,
  getExhibitorProgramHref,
} from "@/lib/participants/exhibitor-detail-links";
import {
  hubMembersToCarouselSlides,
  toExhibitorItemFromHubMember,
} from "@/lib/participants/map-exhibitor-display-props";
import BigButton from "../big-button";

type Props = {
  hub: ExhibitorHubDetail;
};

const ExhibitorHubDetailView = ({ hub }: Props) => {
  const displayLabel = hub.hubDisplayNumber ?? " ";
  const mapHref = getExhibitorMapHref(hub.mapInfoId);
  const programHref = getExhibitorProgramHref(hub.name);

  return (
    <section
      id="exhibitor-hub-detail-section"
      className="pt-[122px] lg:pt-[113px] text-(--black-color)"
    >
      <HeadlineWCross title={hub.name.toUpperCase()} />
      <div className="max-w-[1045px] w-full mx-auto">
        <ExhibitorImagesCarousel
          slides={hubMembersToCarouselSlides(hub.members)}
          ariaLabel={`Profile images of ${hub.name} hub members`}
          navAriaLabel="Hub members"
        />
        <div className="max-w-[1045px] w-full mx-auto lg:gap-[30px] lg:pt-[60px]">
          {hub.description && (
            <ExhibitorDescription
              entityName={hub.name}
              descriptionHtml={hub.description}
            />
          )}

          <article
            id="exhibitor-hub-detail-info-section"
            className="border-t border-(--black-color) pt-[30px] lg:border-t-2"
          >
            <div className="flex items-start gap-[20px]">
              <RoundedNumber
                type={hub.type}
                participant_n={displayLabel}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="base-text-size h-[26px] pt-1">{hub.name.toUpperCase()}</h2>
                <ul
                  className="grid grid-cols-1 lg:grid-cols-3 gap-y-[60px] lg:gap-x-[30px] pt-[30px] list-none justify-self-center"
                  aria-label={`Exhibitors in ${hub.name}`}
                >
                  {hub.members.map((member) => (
                    <li key={member.userId} className="mx-auto w-full">
                      <ExhibitorCard exhibitor={toExhibitorItemFromHubMember(member)} />
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </article>
          <div className="flex justify-center gap-[20px] pt-[30px] lg:pt-[60px]">
            <BigButton
              label="map"
              href={mapHref}
              mode="navbar"
              as="link"
            />
            <BigButton
              label="events"
              href={programHref}
              mode="navbar"
              as="link"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExhibitorHubDetailView;
