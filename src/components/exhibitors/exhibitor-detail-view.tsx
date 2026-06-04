"use client";

import type { ExhibitorDisplayProps } from "@/components/exhibitors/exhibitor-display-props";
import {
  getExhibitorMapHref,
  getExhibitorProgramHref,
} from "@/lib/participants/exhibitor-detail-links";
import ExhibitorDescription from "@/components/exhibitors/exhibitor-description";
import ExhibitorDetailInfo from "@/components/exhibitors/exhibitor-detail-info";
import ExhibitorImagesCarousel from "@/components/exhibitors/exhibitor-images-carousel";
import HeadlineWCross from "../headline-w-cross";
import RoundedNumber from "../rounded-number";
import BigButton from "../big-button";

const ExhibitorDetailView = ({
  type,
  name,
  carouselSlides,
  displayLabel,
  description,
  contactInfo,
}: ExhibitorDisplayProps) => {
  const mapHref = getExhibitorMapHref(contactInfo?.mapInfo[0]?.id);
  const programHref = getExhibitorProgramHref(name);

  return (
    <section id="exhibitor-detail-section" className="text-(--black-color) pt-[122px] lg:pt-[113px]">
      <HeadlineWCross title={name.toUpperCase()} />
      <div className="max-w-[1045px] w-full mx-auto">
        <ExhibitorImagesCarousel
          slides={carouselSlides}
          ariaLabel={`Profile images of ${name}`}
          navAriaLabel={`${name} profile images`}
        />

        <div className="lg:grid grid-cols-2 lg:gap-[30px] lg:pt-[60px]">
          {description ? (
            <ExhibitorDescription
              entityName={name}
              descriptionHtml={description}
            />
          ) : (<div className="pt-[30px] lg:pt-0" aria-label="No description available"></div>)}

          <article
            id="exhibitor-detail-description-section"
            className="border-t border-(--black-color) pt-[30px] lg:border-t-2"
          >
            <div className="flex items-start gap-[20px]">
              <RoundedNumber
                type={type}
                participant_n={displayLabel}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="base-text-size h-[26px] pt-1">{name.toUpperCase()}</h2>
                {contactInfo && (
                  <ExhibitorDetailInfo contactInfo={contactInfo} />
                )}
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
                    target="_self"
                    as="link"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section >
  );
};

export default ExhibitorDetailView;
