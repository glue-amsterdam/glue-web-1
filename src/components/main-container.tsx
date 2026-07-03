import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const MainContainer = forwardRef<HTMLDivElement, Props>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-8 xl:px-0 lg:max-w-[1260px] mx-auto", className)}
      >
        {children}
      </div>
    );
  },
);

MainContainer.displayName = "MainContainer";

export default MainContainer;
