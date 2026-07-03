"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  setCookieConsent,
  getCookieConsentStatus,
  type CookieConsentStatus,
} from "@/app/actions/cookieConsent";
import MainContainer from "../main-container";
import BigButton from "../big-button";
import { cn } from "@/lib/utils";

type CookieBannerContextValue = {
  forceShow: boolean;
  requestShow: () => void;
  subscribeConsentChange: (
    listener: (status: CookieConsentStatus) => void,
  ) => () => void;
  notifyConsentChange: (status: CookieConsentStatus) => void;
};

const CookieBannerContext = createContext<CookieBannerContextValue | null>(
  null,
);

export const CookieBannerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [forceShow, setForceShow] = useState(false);
  const listenersRef = useRef(new Set<(status: CookieConsentStatus) => void>());

  const requestShow = useCallback(() => {
    setForceShow(true);
  }, []);

  const subscribeConsentChange = useCallback(
    (listener: (status: CookieConsentStatus) => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [],
  );

  const notifyConsentChange = useCallback((status: CookieConsentStatus) => {
    setForceShow(false);
    listenersRef.current.forEach((listener) => {
      listener(status);
    });
  }, []);

  return (
    <CookieBannerContext.Provider
      value={{
        forceShow,
        requestShow,
        subscribeConsentChange,
        notifyConsentChange,
      }}
    >
      {children}
    </CookieBannerContext.Provider>
  );
};

export const useRequestCookieBanner = () => {
  const context = useContext(CookieBannerContext);
  return context?.requestShow ?? (() => undefined);
};

export const useCookieBannerConsent = () => {
  const context = useContext(CookieBannerContext);
  return context?.subscribeConsentChange ?? (() => () => undefined);
};

const COOKIES_TEXT = {
  title: "This website uses cookies for session management.",
  description:
    'By clicking "Accept", you consent to the use of session cookies. You can decline if you don\'t want us to use cookies, but it may affect your user experience. To learn all about cookies, check our terms of use.',
  accepted:
    "Cookies are enabled.",
  declined:
    "Cookies are disabled. Some features may not work as expected until you accept cookies.",
} as const;

type CookieBannerProps = {
  variant?: "fixed" | "inline";
};

export function CookieBanner({ variant = "fixed" }: CookieBannerProps) {
  const [consentStatus, setConsentStatus] =
    useState<CookieConsentStatus | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const bannerContext = useContext(CookieBannerContext);
  const forceShow = bannerContext?.forceShow ?? false;

  const isTermsPage = pathname === "/terms-and-conditions";
  const isInline = variant === "inline";

  useEffect(() => {
    const checkConsent = async () => {
      const status = await getCookieConsentStatus();
      setConsentStatus(status);
    };

    checkConsent();
  }, []);

  const handleAccept = async () => {
    await setCookieConsent(true);
    setConsentStatus("accepted");
    bannerContext?.notifyConsentChange("accepted");
    router.refresh();
  };

  const handleDecline = async () => {
    await setCookieConsent(false);
    if (user) {
      await logout();
    }
    setConsentStatus("declined");
    bannerContext?.notifyConsentChange("declined");
    router.refresh();
  };

  if (consentStatus === null) {
    return null;
  }

  if (!isInline && isTermsPage) {
    return null;
  }

  const shouldShowFixedBanner =
    consentStatus === "pending" ||
    (forceShow && consentStatus !== "accepted");

  if (!isInline && !shouldShowFixedBanner) {
    return null;
  }

  const showActions = consentStatus !== "accepted";

  return (
    <aside
      role="dialog"
      aria-label="Cookie consent"
      className={cn(
        "bg-(--background-color)",
        isInline
          ? "title-padding max-w-[1045px] mx-auto"
          : "fixed inset-x-0 bottom-0 z-[999]",
      )}
    >
      <MainContainer>
        <div
          className={cn(
            "main-boder-top flex flex-wrap items-baseline justify-between py-[30px]",
          )}
        >
          <div className="min-w-[300px] max-w-[750px] flex-1 pl-[30px]">
            <p className="versal-body-text uppercase">{COOKIES_TEXT.title}</p>

            <p className="versal-body-text mini-padding">
              {consentStatus === "accepted"
                ? COOKIES_TEXT.accepted
                : consentStatus === "declined"
                  ? COOKIES_TEXT.declined
                  : COOKIES_TEXT.description}
            </p>
          </div>
          <div className="flex shrink-0 gap-[30px] justify-end w-full lg:w-auto lg:flex-col pr-[30px] mini-padding lg:p-0">
            {showActions ? (
              <>
                <BigButton
                  as="button"
                  label="Decline"
                  mode="navbar"
                  fontSize="base"
                  onClick={handleDecline}
                />
                <BigButton
                  as="button"
                  label="Accept"
                  mode="navbar"
                  fontSize="base"
                  onClick={handleAccept}
                />
              </>
            ) : (
              <BigButton
                as="button"
                label="Decline"
                mode="navbar"
                fontSize="base"
                onClick={handleDecline}
              />
            )}
          </div>
          {isInline && (<p className="versal-body-text mini-padding">We use cookies to improve your browsing experience, analyze website traffic, and understand how visitors interact with our site. This helps us enhance performance and provide a better experience.

            By clicking Accept, you consent to the use of analytics and performance cookies. <br />Ccookies are required for the website to function are always enabled.</p>)}
        </div>
      </MainContainer>
    </aside>
  );
}
