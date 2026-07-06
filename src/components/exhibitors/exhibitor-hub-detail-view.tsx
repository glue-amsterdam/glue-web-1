"use client";

import ExhibitorCard from "@/components/exhibitors/exhibitor-card";
import ExhibitorDetailInfo from "@/components/exhibitors/exhibitor-detail-info";
import HeadlineWCross from "@/components/headline-w-cross";
import RoundedNumber from "@/components/rounded-number";
import BigButton from "@/components/big-button";
import type {
  ExhibitorContactInfo,
  ExhibitorHubDetail,
} from "@/lib/participants/exhibitor-detail-types";
import {
  getExhibitorMapHref,
  getExhibitorProgramHref,
} from "@/lib/participants/exhibitor-detail-links";
import { toExhibitorItemFromHubMember } from "@/lib/participants/map-exhibitor-display-props";

type Props = {
  hub: ExhibitorHubDetail;
};

const ExhibitorHubDetailView = ({ hub }: Props) => {
  const displayLabel = hub.hubDisplayNumber ?? " ";
  const mapHref = getExhibitorMapHref(hub.mapInfoId);
  const programHref = getExhibitorProgramHref({
    ownAddress: hub.formattedAddress,
    fallbackName: hub.name,
  });

  const contactInfo: ExhibitorContactInfo = {
    mapInfo:
      hub.mapInfoId && hub.formattedAddress
        ? [
          {
            id: hub.mapInfoId,
            formatted_address: hub.formattedAddress,
            no_address: false,
          },
        ]
        : [],
    phoneNumbers: null,
    visibleEmails: null,
    visibleWebsites: null,
    socialMedia: null,
    visitingHours: null,
    events: hub.events,
  };

  return (
    <section
      id="exhibitor-hub-detail-section"
      className="terms-and-conditions-padding text-(--black-color)"
    >
      <HeadlineWCross title={hub.name.toUpperCase()} />
      <div className="w-full mx-auto title-padding">
        <div className="flex flex-col gap-[40px] lg:grid lg:grid-cols-3 lg:gap-x-[30px] lg:gap-y-[60px]">
          <article
            id="exhibitor-hub-detail-info-section"
            className="order-1 mx-auto w-full max-w-[400px] border-t border-(--black-color) pt-[15px] lg:col-span-1 lg:order-2 lg:mx-0 lg:max-w-none lg:border-t-2"
          >
            <div className="flex items-center gap-[20px]">
              <RoundedNumber
                type={hub.type}
                participant_n={displayLabel}
                className="shrink-0"
              />
              <h2 className="versal-body-text uppercase min-w-0 flex-1">
                {hub.name.toUpperCase()}
              </h2>
            </div>
            <div className="pl-[46px]">
              <ExhibitorDetailInfo contactInfo={contactInfo} />
              <div className="flex gap-[20px] pt-[30px] flex-wrap">
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
          </article>

          <ul
            className="order-2 grid w-full grid-cols-1 justify-items-center main-grid-gap lg:grid-cols-2 lg:justify-items-start lg:pt-0 lg:col-span-2 lg:order-1 list-none"
            aria-label={`Exhibitors in ${hub.name}`}
          >
            {hub.members.map((member) => (
              <li key={member.userId} className="w-full min-w-0">
                <ExhibitorCard exhibitor={toExhibitorItemFromHubMember(member)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ExhibitorHubDetailView;
