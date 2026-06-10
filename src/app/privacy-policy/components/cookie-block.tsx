"use client";
import { useEffect, useState } from "react";
import {
    getCookieConsent,
    setCookieConsent,
} from "@/app/actions/cookieConsent";
import { Switch } from "@/components/ui/switch";

type Props = {}

function CookieBloock({ }: Props) {
    const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
    const [cookiesEnabled, setCookiesEnabled] = useState(false);

    useEffect(() => {
        const checkConsent = async () => {
            const hasConsent = await getCookieConsent();
            setCookiesEnabled(hasConsent);
        };
        checkConsent();
    }, [isCookieSettingsOpen]);

    const handleToggleCookies = async () => {
        await setCookieConsent(!cookiesEnabled);
        setCookiesEnabled(!cookiesEnabled);
    };
    return (
        <div className="max-w-[450px] border p-2">
            <h3 className="base-text-size">Cookie Settings</h3>
            <div className="flex items-center gap-[15px]">
                <Switch
                    id="cookie-consent"
                    checked={cookiesEnabled}
                    onCheckedChange={handleToggleCookies}
                />
                <h3>Enable session cookies</h3>
            </div>
            <p className="base-text-size">Enabling cookies allows us to provide a better user experience.</p>
            <p className="text-sm text-black">
                {cookiesEnabled
                    ? "Cookies are currently enabled."
                    : "Cookies are currently disabled. You won't be able to use certain features of the site."}
            </p>
        </div>
    )
}

export default CookieBloock