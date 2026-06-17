import GlueLogoSVG from "@/app/components/glue-logo-svg";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function LogoWithLink({
  isVisible = true,
  className,
}: {
  isVisible?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className="inline-flex w-fit shrink-0"
      aria-label="Glue home"
    >
      <div className={cn("relative inline-block", className)}>
        <GlueLogoSVG isVisible={isVisible} className="size-full" />
      </div>
    </Link>
  );
}
