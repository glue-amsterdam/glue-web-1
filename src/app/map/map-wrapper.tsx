"use client";

import React, { useState, useEffect } from "react";
import MapMain from "@/app/map/map-main";
import { LoadingFallback } from "@/app/components/loading-fallback";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { Button } from "@/components/ui/button";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";

export function MapWrapper() {
  const [mapConsent, setMapConsent] = useState<boolean | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const consent = await getCookieConsent();
      setMapConsent(consent);
      if (consent === null) {
        setShowConsentDialog(true);
      }
    };
    checkConsent();
  }, []);

  if (mapConsent === null) {
    return <LoadingFallback />;
  }

  return (
    <>
      {mapConsent ? (
        <MapMain />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-center">
            <p className="mb-4">
              Map functionality is limited without cookie consent.
            </p>
            <Button onClick={() => setShowConsentDialog(true)}>
              Enable Full Map
            </Button>
          </div>
        </div>
      )}
      <CookieSettingsModal
        isOpen={showConsentDialog}
        onClose={() => {
          setShowConsentDialog(false);
          getCookieConsent().then(setMapConsent);
        }}
      />
    </>
  );
}