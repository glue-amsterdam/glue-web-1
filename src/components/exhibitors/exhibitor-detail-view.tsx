"use client";

import type { ExhibitorDisplayProps } from "@/components/exhibitors/exhibitor-display-props";
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
  navigation,
}: ExhibitorDisplayProps) => {
  const showNavigation = navigation.showMap || navigation.showEvents;

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
            <div className="flex items-center gap-[20px]">
              <RoundedNumber
                type={type}
                participant_n={displayLabel}
                className="shrink-0"
              />
              <h2 className="versal-body-text uppercase min-w-0 flex-1">
                {name.toUpperCase()}
              </h2>
            </div>
            <div className="pl-[46px]">
              {contactInfo && <ExhibitorDetailInfo contactInfo={contactInfo} />}
              {showNavigation ? (
                <div className="flex gap-[20px] pt-[30px] flex-wrap">
                  {navigation.showMap && navigation.mapHref ? (
                    <BigButton
                      label="map"
                      href={navigation.mapHref}
                      mode="navbar"
                      as="link"
                    />
                  ) : null}
                  {navigation.showEvents && navigation.eventsHref ? (
                    <BigButton
                      label="events"
                      href={navigation.eventsHref}
                      mode="navbar"
                      target="_self"
                      as="link"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </div>
    </section >
  );
};

export default ExhibitorDetailView;
