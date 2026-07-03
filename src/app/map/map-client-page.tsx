"use client";

import { Suspense, useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  getCookieConsentStatus,
  type CookieConsentStatus,
} from "@/app/actions/cookieConsent";
import {
  useCookieBannerConsent,
  useRequestCookieBanner,
} from "@/components/cookies/cookies-banner";
import type { MapPageData } from "@/lib/map/types";
import MapMain from "./map-main";
import MapStoreEarlyHydrator from "./map-store-early-hydrator";
import BigButton from "@/components/big-button";

type MapClientPageProps = {
  initialData: MapPageData;
};

const MapClientPage = ({ initialData }: MapClientPageProps) => {
  const [consentStatus, setConsentStatus] =
    useState<CookieConsentStatus | null>(null);
  const requestCookieBanner = useRequestCookieBanner();
  const subscribeConsentChange = useCookieBannerConsent();

  useEffect(() => {
    const checkConsent = async () => {
      const status = await getCookieConsentStatus();
      setConsentStatus(status);
      if (status === "pending") {
        requestCookieBanner();
      }
    };

    void checkConsent();
  }, [requestCookieBanner]);

  useEffect(() => {
    return subscribeConsentChange((status) => {
      setConsentStatus(status);
    });
  }, [subscribeConsentChange]);

  if (consentStatus === null) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <MapStoreEarlyHydrator initialData={initialData} />
      </Suspense>
      {consentStatus === "accepted" ? (
        <Suspense fallback={<LoadingSpinner />}>
          <MapMain initialData={initialData} />
        </Suspense>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          role="status"
        >
          <div className="text-center">
            <p className="mb-4 versal-body-text">
              Map functionality is limited without cookie consent.
            </p>
            <BigButton
              as="button"
              label="Enable Full Map"
              mode="navbar"
              fontSize="base"
              onClick={requestCookieBanner}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MapClientPage;
