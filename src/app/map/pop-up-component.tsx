"use client";

import { memo } from "react";
import { X } from "lucide-react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import CarouselPopUp from "@/app/map/carousel-pop-up";
import { Popup } from "react-map-gl";
import type { PopupInfo } from "@/app/map/map-component";
import { Anchor } from "mapbox-gl";

type Props = {
  isLoading: boolean;
  popupInfo: PopupInfo;
  handlePopupClose: () => void;
  isError?: boolean;
};

function PopUpComponent({
  isLoading,
  popupInfo,
  handlePopupClose,
  isError,
}: Props) {
  // Common popup configuration
  const popupConfig = {
    longitude: popupInfo.longitude,
    latitude: popupInfo.latitude,
    onClose: handlePopupClose,
    closeButton: false,
    closeOnClick: false,
    anchor: "center" as Anchor,
    className: "custom-map-popup",
  };

  // Loading state
  if (isLoading) {
    return (
      <Popup {...popupConfig}>
        <div className="popup-wrapper">
          <button
            onClick={handlePopupClose}
            className="popup-close-btn"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="popup-loading">
            <LoadingSpinner />
          </div>
        </div>
      </Popup>
    );
  }

  // Error state
  if (isError) {
    return (
      <Popup {...popupConfig}>
        <div className="popup-wrapper">
          <button
            onClick={handlePopupClose}
            className="popup-close-btn"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="popup-error">
            <p className="text-red-600 text-center">
              Failed to load location data.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-2 bg-black text-white rounded-md hover:bg-opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </Popup>
    );
  }

  // Data loaded state
  return (
    <Popup {...popupConfig}>
      <div className="popup-wrapper">
        <button
          onClick={handlePopupClose}
          className="popup-close-btn"
          aria-label="Close popup"
        >
          <X className="h-5 w-5 text-black" />
        </button>
        <div className="popup-content">
          <CarouselPopUp popupInfo={popupInfo} />
        </div>
      </div>
    </Popup>
  );
}

const MemoizedPopUpComponent = memo(PopUpComponent);

export default MemoizedPopUpComponent;
