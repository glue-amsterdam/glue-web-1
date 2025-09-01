"use client";
import { usePathname, useRouter } from "next/navigation";
import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import { gsap } from "gsap";
import LogoWithLink from "./LogoWithLink";
import SearchForm from "./navbar/SearchForm";
import SocialIcons from "./navbar/SocialIcons";
import UserMenu from "./navbar/UserMenu";
import { OverlayNavMenu } from "./navbar/OverlayNavMenu";
import { useMenu } from "@/app/context/MainContext";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useOverlayState } from "@/hooks/useOverlayState";
import { MdMenu } from "react-icons/md";
import LoginForm from "@/app/components/login-form/login-form";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface NavBarProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.RefObject<HTMLElement>;
}

const NavBar = forwardRef<HTMLElement, NavBarProps>(
  ({ className, style, ...props }, ref) => {
    const [isLogoVisible, setIsLogoVisible] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const navItems = useMenu();
    const { isOpen, closeOverlay, toggleOverlay } = useOverlayState();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const isMobile = useMediaQuery("(min-width: 768px)");

    const overlayRef = useRef<HTMLDivElement>(null);

    const handleLoginModal = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsLoginModalOpen(true);
    };

    const handleLoginSuccess = (loggedInUser: User) => {
      setIsLoginModalOpen(false);
      if (pathname === "/") {
        router.push(`/dashboard/${loggedInUser.id}/user-data`);
      } else {
        router.refresh();
      }
    };

    const handleSearch = (query: string) => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        closeOverlay();
      }
    };

    useEffect(() => {
      if (pathname !== "/" || isOpen) {
        setIsLogoVisible(true);
      } else {
        setIsLogoVisible(!isMobile);
      }
    }, [pathname, isMobile, isOpen]);

    const handleMenuClick = () => {
      toggleOverlay();
    };

    // GSAP animations for overlay
    useEffect(() => {
      if (!overlayRef.current) return;

      if (isOpen) {
        // Show overlay with animation
        gsap.set(overlayRef.current, {
          display: "flex",
          yPercent: -100,
          opacity: 0,
        });
        gsap.to(overlayRef.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        });
      } else {
        // Hide overlay with animation
        gsap.to(overlayRef.current, {
          yPercent: -100,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(overlayRef.current, { display: "none" });
          },
        });
      }
    }, [isOpen]);

    // Prevent body scroll when overlay is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }, [isOpen]);

    // Handle Escape key to close overlay
    useEffect(() => {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) {
          closeOverlay();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
          document.removeEventListener("keydown", handleEscapeKey);
        };
      }
    }, [isOpen, closeOverlay]);

    return (
      <>
        <nav
          ref={ref}
          className={cn(
            "fixed top-0 left-0 right-0 px-4 py-2 flex items-center justify-center md:justify-between gap-4 z-50",
            isOpen
              ? "bg-black"
              : isLogoVisible && pathname !== "/"
              ? "bg-black/50 backdrop-blur-lg"
              : "bg-transparent",
            className
          )}
          style={style}
          {...props}
        >
          <div
            onClick={isOpen ? toggleOverlay : undefined}
            className={`${
              !isLogoVisible
                ? "hidden pointer-events-none"
                : "opacity-100 hover:scale-105 transition-all duration-100"
            }`}
          >
            <LogoWithLink isVisible={isLogoVisible} />
          </div>

          <div className="hidden w-full md:flex items-center justify-center gap-2 pt-2">
            <Suspense>
              <SearchForm
                onSearch={handleSearch}
                className="bg-white"
                onSearchComplete={closeOverlay}
              />
            </Suspense>
            <div
              className={cn(
                "transition-opacity duration-300 flex items-center justify-center gap-2",
                isOpen ? "opacity-0" : "opacity-100"
              )}
            >
              <SocialIcons />
              <UserMenu handleLoginModal={handleLoginModal} />
            </div>
          </div>

          <button
            type="button"
            className="z-[60] relative"
            onClick={handleMenuClick}
            aria-label="Toggle navigation menu"
          >
            <MdMenu className={cn("size-10 cursor-pointer")} />
          </button>
        </nav>

        {/* Overlay */}
        <div
          data-lenis-prevent
          ref={overlayRef}
          className="fixed inset-0 bg-white z-40 flex flex-col pt-[5rem]"
          style={{ display: "none", width: "100dvw", height: "100dvh" }}
        >
          <div className="flex-1 min-h-[60vh] overflow-y-auto">
            <OverlayNavMenu
              navItems={navItems}
              closeOverlay={closeOverlay}
              handleLoginModal={handleLoginModal}
            />
          </div>

          {/* Social icons at the bottom of overlay */}
          <div className="border-t border-black/20 flex flex-col gap-1 py-4 items-center justify-center z-[51] bg-black w-full flex-shrink-0">
            <Suspense>
              <SearchForm
                onSearch={handleSearch}
                className="bg-white md:hidden"
                onSearchComplete={closeOverlay}
              />
            </Suspense>

            <div className="flex items-center justify-center bg-black w-full">
              <SocialIcons />
            </div>
          </div>
          <LoginForm
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </>
    );
  }
);

NavBar.displayName = "NavBar";

export default NavBar;
