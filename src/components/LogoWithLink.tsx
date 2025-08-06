import GlueLogoSVG from "@/app/components/glue-logo-svg";
import { cn } from "@/lib/utils";
import { Link } from "next-view-transitions";
import React from "react";

export default function LogoWithLink({
  isVisible = true,
  className,
}: {
  isVisible?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" data-navigation="true">
      <div className={cn("relative size-14", className)}>
        <GlueLogoSVG
          isVisible={isVisible}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </Link>
  );
}
