"use client";

import { Button } from "@/components/ui/button";

const DEFAULT_HEADING_ID = "login-already-registered-heading";
const DEFAULT_PANEL_ID = "login-form-main-panel";

type LoginAlreadyRegisteredTeaserProps = {
  onRevealLogin: () => void;
  formPanelId?: string;
  headingId?: string;
};

export const LoginAlreadyRegisteredTeaser = ({
  onRevealLogin,
  formPanelId = DEFAULT_PANEL_ID,
  headingId = DEFAULT_HEADING_ID,
}: LoginAlreadyRegisteredTeaserProps) => {
  const handleRevealLoginClick = () => {
    onRevealLogin();
  };

  return (
    <div
      className="rounded-lg border border-primary/20 bg-white/80 p-4 shadow-sm"
      role="region"
      aria-labelledby={headingId}
    >
      <p
        id={headingId}
        className="text-center text-sm font-medium text-foreground"
      >
        Already registered?
      </p>
      <Button
        type="button"
        className="mt-3 w-full hover:bg-[var(--color-box2)]"
        onClick={handleRevealLoginClick}
        aria-expanded={false}
        aria-controls={formPanelId}
        aria-label="Show log in form for existing accounts"
      >
        Log in
      </Button>
    </div>
  );
};
