import React from "react";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import CarouselPopUp from "@/app/map/carousel-pop-up";
import { Popup } from "react-map-gl";
import { PopupInfo } from "@/app/map/map-component";

type Props = {
  isLoading: boolean;
  popupInfo: PopupInfo;
  handlePopupClose: () => void;
};

function PopUpComponent({ isLoading, popupInfo, handlePopupClose }: Props) {
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
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner />
          </div>
        ) : (
          <CarouselPopUp popupInfo={popupInfo} />
        )}
      </div>
    </Popup>
  );
}

export default PopUpComponent;
