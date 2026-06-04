"use client";

import { Suspense, useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { Button } from "@/components/ui/button";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";
import type { MapPageData } from "@/lib/map/types";
import MapMain from "./map-main";
import MapStoreEarlyHydrator from "./map-store-early-hydrator";

type MapClientPageProps = {
  initialData: MapPageData;
};

const MapClientPage = ({ initialData }: MapClientPageProps) => {
  const [mapConsent, setMapConsent] = useState<boolean | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const consent = await getCookieConsent();
      setMapConsent(consent);
      if (consent === null) setShowConsentDialog(true);
    };
    void checkConsent();
  }, []);

  if (mapConsent === null) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <MapStoreEarlyHydrator initialData={initialData} />
      </Suspense>
      {mapConsent ? (
        <Suspense fallback={<LoadingSpinner />}>
          <MapMain initialData={initialData} />
        </Suspense>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-200"
          role="status"
        >
          <div className="text-center">
            <p className="mb-4">
              Map functionality is limited without cookie consent.
            </p>
            <Button type="button" onClick={() => setShowConsentDialog(true)}>
              Enable Full Map
            </Button>
          </div>
        </div>
      )}
      <CookieSettingsModal
        isOpen={showConsentDialog}
        onClose={() => {
          setShowConsentDialog(false);
          void getCookieConsent().then(setMapConsent);
        }}
      />
    </>
  );
};

export default MapClientPage;
