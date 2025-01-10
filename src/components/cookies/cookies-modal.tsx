"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getCookieConsent,
  setCookieConsent,
} from "@/app/actions/cookieConsent";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettingsModal({
  isOpen,
  onClose,
}: CookieSettingsModalProps) {
  const [cookiesEnabled, setCookiesEnabled] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const hasConsent = await getCookieConsent();
      setCookiesEnabled(hasConsent);
    };
    checkConsent();
  }, [isOpen]);

  const handleToggleCookies = async () => {
    await setCookieConsent(!cookiesEnabled);
    setCookiesEnabled(!cookiesEnabled);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-black">
        <DialogHeader>
          <DialogTitle>Cookie Settings</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences here. Enabling cookies allows us to
            provide a better user experience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <Switch
            id="cookie-consent"
            checked={cookiesEnabled}
            onCheckedChange={handleToggleCookies}
          />
          <Label htmlFor="cookie-consent">Enable session cookies</Label>
        </div>
        <DialogDescription className="text-sm text-black">
          {cookiesEnabled
            ? "Cookies are currently enabled. You can log in."
            : "Cookies are currently disabled. You won't be able to log in or use certain features of the site."}
        </DialogDescription>
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
