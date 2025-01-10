"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";

export const PrivacyPolicy: React.FC = () => {
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = React.useState(false);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Privacy Policy - Cookie Usage</CardTitle>
        <CardDescription className="sr-only">
          Our privacy policy regarding the use of cookies on our website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4">
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
            <p>
              This Privacy Policy explains how we use cookies and similar
              technologies on our website. We use these technologies to improve
              your browsing experience, analyze our website traffic, and provide
              personalized content and advertisements.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">2. What are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when
              you visit a website. They are widely used to make websites work
              more efficiently and provide information to the owners of the
              site.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              3. Types of Cookies We Use
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> These are necessary for the
                website to function properly. They enable basic functions like
                page navigation and access to secure areas of the website.
              </li>
              <li>
                <strong>Analytical/Performance Cookies:</strong> These cookies
                allow us to recognize and count the number of visitors and see
                how visitors move around our website when they are using it.
                This helps us improve the way our website works.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> These cookies are used
                to recognize you when you return to our website. This enables us
                to personalize our content for you and remember your
                preferences.
              </li>
              <li>
                <strong>Targeting Cookies:</strong> These cookies record your
                visit to our website, the pages you have visited, and the links
                you have followed. We use this information to make our website
                and the advertising displayed on it more relevant to your
                interests.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              4. Third-Party Cookies
            </h2>
            <p>
              We use services from third parties like Mapbox for our interactive
              maps. These services may set their own cookies for functionality
              and analytics purposes. Please note that we do not have control
              over these third-party cookies.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              5. Managing Your Cookie Preferences
            </h2>
            <p>{`You can manage your cookie preferences at any time by clicking the "Cookie Settings" button below. You can also adjust your browser settings to refuse cookies. However, please note that disabling certain cookies may impact the functionality of our website.`}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              6. Changes to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. We encourage
              you to review this policy periodically to stay informed about our
              use of cookies.
            </p>
          </section>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setIsCookieSettingsOpen(true)}>
          Cookie Settings
        </Button>
      </CardFooter>
      <CookieSettingsModal
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </Card>
  );
};
