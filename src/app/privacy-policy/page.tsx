import { PrivacyPolicy } from "@/components/cookies/privacy-policy";
import { NAVBAR_HEIGHT } from "@/constants";

export const metadata = {
  title: "Privacy Policy - Cookie Usage",
  description:
    "Our privacy policy regarding the use of cookies on our website.",
};

export default function PrivacyPolicyPage() {
  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="container mx-auto py-8"
    >
      <PrivacyPolicy />
    </div>
  );
}
