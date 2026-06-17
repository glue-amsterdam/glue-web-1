"use client";

import { memo, useCallback, useMemo } from "react";
import Image from "next/image";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import { buildExhibitorFooterSlides, findExhibitorSlideIndex } from "@/lib/map/exhibitor-footer-slides";
import { isMapHubEntity } from "@/lib/map/map-location-display";
import { buildGoogleMapsSearchUrl } from "@/lib/map/utils";
import type { MapLocation, MapTourMode } from "@/lib/map/types";
import { useMapLocationDetail } from "../hooks/use-map-location-detail";
import MainContainer from "@/components/main-container";
import RoundedNumber from "@/components/rounded-number";
import CrossRotatedMobile from "@/components/icons/cross-rotated-mobile";
import BigButton from "@/components/big-button";
import SlideLineNav from "@/components/slide-line-nav";

const DEFAULT_AUTOPLAY_DELAY_MS = 3000;

type ExhibitorFooterProps = {
    location: MapLocation;
    tourMode: MapTourMode;
    selectedHubMemberId?: string | null;
    delayMs?: number;
    onClose: () => void;
};

const ExhibitorFooter = ({
    location,
    tourMode,
    selectedHubMemberId = null,
    delayMs = DEFAULT_AUTOPLAY_DELAY_MS,
    onClose,
}: ExhibitorFooterProps) => {
    const canFetchDetail = tourMode === "live";
    const { detail, isLoading } = useMapLocationDetail(location.id, canFetchDetail);

    const slides = useMemo(
        () => buildExhibitorFooterSlides(location, detail),
        [location, detail]
    );

    const initialSlideIndex = useMemo(
        () => findExhibitorSlideIndex(slides, selectedHubMemberId),
        [slides, selectedHubMemberId]
    );

    const {
        currentIndex,
        hasMultiple,
        handleMouseEnter,
        handleMouseLeave,
        handleSelect,
    } = useCyclicIndex({
        itemCount: slides.length,
        delayMs,
        enabled: slides.length > 1,
        initialIndex: initialSlideIndex,
    });

    const currentSlide = slides[currentIndex] ?? slides[0];

    const isHubEntity = isMapHubEntity(location);

    const displayName = isHubEntity ? location.name : currentSlide.name;

    const handleGoogleMapsRedirect = useCallback(() => {
        window.open(buildGoogleMapsSearchUrl(location), "_blank");
    }, [location]);

    if (!currentSlide) {
        return null;
    }

    const showLoading = canFetchDetail && isLoading && !detail;

    return (
        <div
            data-exhibitor-footer
            className="fixed bottom-0 mb-(--site-footer-h) left-0 right-0 text-(--black-color) bg-(--white-color) z-51 h-[350px] base-text-size"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <MainContainer>
                <div className="border-t border-(--black-color) px-[20px] pt-[15px] pb-[20px]">
                    <div className="flex gap-[25px] items-start w-full">
                        <RoundedNumber type={location.type} participant_n={location.displayNumber ?? " "} />
                        <div className="w-full">
                            <div className="w-full flex justify-between" aria-live="polite" aria-atomic="true">
                                <h3 className="truncate ">{displayName.toUpperCase()}</h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer"
                                    aria-label="Close exhibitor details"
                                >
                                    <CrossRotatedMobile />
                                </button>
                            </div>
                            <div className="pt-[15px] pl-[4px]">
                                {isHubEntity ? (
                                    <p>{currentSlide.name}</p>
                                ) : (
                                    <p>{location.addressLine}</p>
                                )}
                            </div></div>
                    </div>
                    <div
                        className={"flex w-full h-[190px] overflow-hidden mx-auto pt-[15px]"}
                    >
                        {showLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : currentSlide.imageUrl ? (

                            <Image
                                src={currentSlide.imageUrl}
                                alt={`Image of ${currentSlide.name}`}
                                width={300}
                                height={190}
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="h-full w-full object-contain object-top"
                            />

                        ) : <></>}</div>

                    <SlideLineNav
                        items={slides.map((slide) => ({ id: slide.id, label: slide.name }))}
                        currentIndex={currentIndex}
                        onSelect={handleSelect}
                        ariaLabel={isHubEntity ? "Hub members" : "Exhibitor images"}
                        size="compact"
                    />

                    <div className={`flex justify-center gap-[15px] ${hasMultiple ? "pt-[10px]" : "pt-[15px]"}`}>
                        <BigButton
                            as="button"
                            mode="footer"
                            fontSize="small"
                            label="navigate"
                            onClick={handleGoogleMapsRedirect} />
                        {currentSlide.profileHref && (
                            <BigButton
                                as="link"
                                mode="footer"
                                fontSize="small"
                                label="profile"
                                href={currentSlide.profileHref} />
                        )}
                    </div></div>
            </MainContainer>
        </div>
    );
};

export default memo(ExhibitorFooter);
