import { sanitizeHtml } from "@/lib/sanitize-html";
import { privacyPolicyMetadata } from "@/lib/metadata";
import CookieBloock from "./components/cookie-block";
import MainContainer from "@/components/main-container";
import BottomBlock from "@/components/bottom-block";
import type { Metadata } from "next";


export const metadata: Metadata = privacyPolicyMetadata;

const privacyPolicyContent = {
  title: "Privacy Policy - Cookie Usage",
  description:
    "At GLUE, we take the protection of your personal data very seriously. This privacy policy explains how we collect, use, store and protect your data.<br /> Please contact us if you have any questions about our privacy policy.<br /> Last updated: January 28, 2026",
  items: [
    {
      title: "1. Introduction",
      description: `This Privacy Policy aims to inform, in a transparent manner, how Semaine Design de Montréal collects, uses, stores, protects, and discloses personal information obtained through its activities, events, and digital platforms.
<br />
Semaine Design de Montréal is committed to complying with applicable privacy laws, including the Act respecting the protection of personal information in the private sector, as amended by Bill 25 (Québec).`,
    },
    {
      title: "2. Definitions",
      description: `Personal Information: Any information relating to an identifiable natural person, directly or indirectly.

Processing: Any operation performed on personal information (collection, use, disclosure, retention, destruction).
‍
Consent: A free, informed, and specific expression of a person’s will.`,
    },
    {
      title: "3. Collection of Personal Information",
      description: `Semaine Design de Montréal collects only the information necessary to carry out its activities. This may include:
– First and last name
– Email address, telephone number
– Organization, professional title
– Event registration data
– Communication preferences
– Browsing data (cookies, IP addresses, connection logs)

Personal information is collected when a person completes a form, registers for an activity, contacts Semaine Design de Montréal, or browses its digital platforms.`,
    },
    {
      title: "4. Purposes of Collection",
      description: `Personal information is used to:<br />
– Manage event registrations and participation <br />
– Communicate information related to activities<br />
– Respond to inquiries<br />
– Improve services and digital tools<br />
– Comply with legal obligations<br />`,
    },
    {
      title: "5. Consent",
      description: `Semaine Design de Montréal obtains consent prior to collecting, using, or disclosing personal information, except where permitted by law.
Consent may be withdrawn at any time, subject to legal or contractual obligations.`,
    },
    {
      title: "6. Disclosure to Third Parties",
      description: `Personal information may be disclosed to service providers (hosting, ticketing, newsletters, etc.) solely for the purposes described above.
‍
Before any disclosure outside Québec, Semaine Design de Montréal conducts a privacy impact assessment and ensures that equivalent protection measures are in place.`,
    },
    {
      title: "7. Retention and Destruction",
      description: `Personal information is retained only for as long as necessary to fulfill the purposes for which it was collected or as required by law. It is then securely destroyed or anonymized.`,
    },
    {
      title: "8. Security Measures",
      description: `Semaine Design de Montréal implements physical, technological, and administrative security measures to protect personal information against loss, unauthorized access, misuse, or disclosure.`,
    },
    {
      title: "9. Rights of Individuals",
      description: `In accordance with the law, any person may: <br />
– Access their personal information<br />
– Request correction<br />
– Withdraw their consent<br />
– Request deletion of their personal information, where permitted by law<br />`,
    },
    {
      title: "10. Person in Charge of the Protection of Personal Information",
      description: `Sandra Heintz <br />Person in Charge of the Protection of Personal Information<br />Semaine Design de Montréal, <br />represented by Archi-Design QC<br />
Address: 41 King Street, Montréal, Québec, H3C 2P1<br />Email: semainedesign@index-design.ca<br />Phone: 438-794-3302`,
    },
    {
      title: "11. Cookies",
      description: `GLUE uses a limited set of cookies on its digital platforms:<br />
– Session cookies: Required to maintain your login session and access authenticated features. These cookies are essential for the website to function and cannot be disabled if you wish to use your account.<br />
– Third-party cookies: Some features require cookies from external service providers. Mapbox, used for interactive maps, may set cookies strictly necessary for map display and functionality.<br />
<br />`,
    },
  ],
};

export default function PrivacyPolicyPage() {
  const sanitizedDescription = sanitizeHtml(privacyPolicyContent.description);
  const sanitizedItems = privacyPolicyContent.items.map((item) => ({
    title: item.title,
    sanitizedDescription: sanitizeHtml(item.description),
  }));

  return (
    <main id="privacy-policy-page" className="first-padding">
      <MainContainer className="mini-padding">
        <h1 className="title-text">{privacyPolicyContent.title.toUpperCase()}</h1>
        {sanitizedDescription ? (
          <div
            className="base-text-size mt-2"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        ) : null}
        <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-2 lg:gap-[60px] pt-[30px] lg:pt-[60px]">
          {sanitizedItems.map((item, index) => (
            <div key={index}>
              <h3 className="base-text-size">{item.title.toUpperCase()}</h3>
              <div
                className="base-text-size"
                dangerouslySetInnerHTML={{ __html: item.sanitizedDescription }}
              />
            </div>
          ))}
        </div>
        <CookieBloock />
        <BottomBlock />
      </MainContainer>
    </main>
  );
}
