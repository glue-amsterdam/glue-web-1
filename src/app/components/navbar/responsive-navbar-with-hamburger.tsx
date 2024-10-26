"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import UserMenu from "./user-menu";
import GlueLogoSVG from "@/app/components/glue-logo-svg";
import { useMenu } from "@/app/context/MainContext";
import AnimatedNavMenu from "@/app/components/navbar/animated-nav-menu";
import SearchForm from "@/app/components/navbar/search-form";
import SocialIcons from "@/app/components/navbar/social-icon";
import MobileSheet from "@/app/components/navbar/mobile-sheet";

export default function NavbarBurger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const navItems = useMenu();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (pathname !== "/") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      <header
        className={`${
          isVisible && "select-none backdrop-blur-lg bg-uiblack/20"
        } w-full h-20 z-50 absolute top-0 drop-shadow-md`}
      >
        <motion.div
          className="absolute inset-0 z-0 bg-transparent"
          initial={false}
          animate={{
            translateY: isVisible ? "0%" : "-100%",
          }}
          transition={{ duration: 0.3 }}
        />

        <div
          className={`relative h-full z-10 mx-auto  ${
            !isVisible ? "md:max-w-[580px] xl:max-w-[800px]" : "md:max-w-full"
          } transition-all duration-500`}
        >
          <nav className="flex items-center h-full justify-center md:justify-between p-4 w-full gap-4">
            <div
              className={`${
                !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
              }  flex-1 hidden justify-start md:flex`}
            >
              <AnimatedNavMenu navItems={navItems} />
            </div>
            <div className="hidden flex-1 md:flex items-center space-x-4 flex-grow justify-center">
              <SearchForm
                onSearch={handleSearch}
                onSearchComplete={() => setIsOpen(false)}
              />
            </div>

            <div className="hidden justify-end flex-1 md:flex items-center space-x-4">
              <SocialIcons />
              <UserMenu />
              <div
                className={`${
                  !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
                } flex`}
              >
                <Link href="/">
                  <div className="relative size-14">
                    <GlueLogoSVG
                      isVisible={isVisible}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </Link>
              </div>
            </div>
            <MobileSheet
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              handleSearch={handleSearch}
              navItems={navItems}
            />
          </nav>
        </div>
      </header>
    </AnimatePresence>
  );
}
