import React, { memo } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import CarouselPopUp from "@/app/map/carousel-pop-up";
import { Popup } from "react-map-gl";
import { PopupInfo } from "@/app/map/map-component";

type Props = {
  isLoading: boolean;
  popupInfo: PopupInfo;
  handlePopupClose: () => void;
  isError?: boolean; // Add error handling
};

function PopUpComponent({
  isLoading,
  popupInfo,
  handlePopupClose,
  isError,
}: Props) {
  console.log(popupInfo);
  // Early return for loading state
  if (isLoading) {
    return (
      <Popup
        anchor="center"
        longitude={popupInfo.longitude}
        latitude={popupInfo.latitude}
        onClose={handlePopupClose}
        closeButton={false}
        closeOnClick={false}
      >
        <div className="w-64 sm:w-80 md:w-96 overflow-hidden rounded-lg shadow-md bg-white">
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner />
          </div>
        </div>
      </Popup>
    );
  }

  // Early return for error state
  if (isError) {
    return (
      <Popup
        anchor="center"
        longitude={popupInfo.longitude}
        latitude={popupInfo.latitude}
        onClose={handlePopupClose}
        closeButton={false}
        closeOnClick={false}
      >
        <div className="w-64 sm:w-80 md:w-96 overflow-hidden rounded-lg shadow-md bg-white">
          <div className="flex items-center justify-center h-48 p-4 text-red-600">
            Failed to load location data. Please try again.
          </div>
        </div>
      </Popup>
    );
  }

  // Render the popup with data
  return (
    <Popup
      anchor="center"
      longitude={popupInfo.longitude}
      latitude={popupInfo.latitude}
      onClose={handlePopupClose}
      closeButton={false}
      closeOnClick={false}
      aria-label="Location details"
    >
      <div className="w-64 sm:w-80 md:w-96 overflow-hidden rounded-lg shadow-md bg-white">
        <CarouselPopUp popupInfo={popupInfo} />
      </div>
    </Popup>
  );
}

const MemoizedPopUpComponent = memo(PopUpComponent);

export default MemoizedPopUpComponent;
