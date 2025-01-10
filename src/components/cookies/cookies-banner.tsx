"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CookieConsent from "react-cookie-consent";
import {
  setCookieConsent,
  getCookieConsent,
} from "@/app/actions/cookieConsent";
import Link from "next/link";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleAccept = async () => {
    console.log("Session cookies accepted");
    await setCookieConsent(true);
    router.refresh();
  };

  const handleDecline = async () => {
    console.log("Session cookies declined");
    await setCookieConsent(false);
    if (user) {
      await logout();
    }
    router.refresh();
  };

  useEffect(() => {
    const checkConsent = async () => {
      const hasConsent = await getCookieConsent();
      setShowBanner(!hasConsent);
    };
    checkConsent();
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      declineButtonText="Decline"
      cookieName="session-cookie-consent"
      style={{ background: "#2B373B" }}
      buttonStyle={{ color: "#4e503b", fontSize: "13px" }}
      declineButtonStyle={{ color: "#f7f7f2", fontSize: "13px" }}
      expires={150}
      onAccept={handleAccept}
      onDecline={handleDecline}
      enableDeclineButton={true}
    >
      <p className="text-sm">
        This website uses cookies for session management.
      </p>
      <p className="text-sm">{`By clicking "Accept", you consent to the use of session cookies. 
      You can decline if you don't want us to use cookies, but it may affect your user experience.`}</p>
      <Link
        href="/privacy-policy"
        target="_blank"
        className="ml-2 text-white underline text-sm"
      >
        View our Privacy Policy
      </Link>
    </CookieConsent>
  );
}
