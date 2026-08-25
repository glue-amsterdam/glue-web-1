"use client";

import type { ExhibitorDisplayProps } from "@/components/exhibitors/exhibitor-display-props";
import ExhibitorDescription from "@/components/exhibitors/exhibitor-description";
import ExhibitorDetailInfo from "@/components/exhibitors/exhibitor-detail-info";
import ExhibitorImagesCarousel from "@/components/exhibitors/exhibitor-images-carousel";
import HeadlineWCross from "../headline-w-cross";
import DisplayNumberCluster from "@/components/display-number-cluster";
import BigButton from "../big-button";

const ExhibitorDetailView = ({
  type,
  name,
  carouselSlides,
  numberBadges,
  description,
  contactInfo,
  navigation,
}: ExhibitorDisplayProps) => {
  const showNavigation = navigation.showMap || navigation.showEvents;

  return (
    <section id="exhibitor-detail-section" className="text-(--black-color) terms-and-conditions-padding">
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
            className="main-boder-top pt-[15px]"
          >
            <div className="flex items-start gap-[20px]">
              <DisplayNumberCluster
                badges={numberBadges}
                fallbackType={type}
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="versal-body-text uppercase">
                  {name.toUpperCase()}
                </h2>
                {contactInfo && <ExhibitorDetailInfo contactInfo={contactInfo} />}
                {showNavigation ? (
                  <div className="flex gap-[20px] pt-[30px] flex-wrap">
                    {navigation.mapHrefs.map((href) => (
                      <BigButton
                        key={href}
                        label="map"
                        href={href}
                        mode="navbar"
                        as="link"
                      />
                    ))}
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
            </div>
          </article>
        </div>
      </div>
    </section >
  );
};

export default ExhibitorDetailView;
