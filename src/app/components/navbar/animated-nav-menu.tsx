"use client";

import GlueLogoSVG from "@/app/components/glue-logo-svg";
import HomePageLogo from "@/app/components/navbar/home-page-logo";
import { MainMenuItem } from "@/utils/menu-types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { ImMenu3, ImMenu4 } from "react-icons/im";

function AnimatedNavMenu({ navItems }: { navItems: MainMenuItem[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const sorteredNavItems = navItems.sort((a, b) =>
    a.section.localeCompare(b.section)
  );

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 400);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (pathname == "/") {
      setIsMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]);

  return (
    <nav className="flex items-center justify-start gap-4 px-2">
      <div
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className=" md:hover:scale-105 md:transition-all"
      >
        {isMenuOpen ? (
          <ImMenu4 className="size-10" />
        ) : (
          <ImMenu3 className="size-10" onClick={() => setIsMenuOpen(true)} />
        )}
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            className="absolute top-full left-0 z-10"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ul className="flex relative bg-uiwhite pb-5 pt-2 shadow-lg">
              <div className="flex justify-center gap-4 px-2">
                <div className="size-36 opacity-20 text-white absolute right-20 bottom-10 z-10  md:hover:scale-105 md:transition-all">
                  <GlueLogoSVG isVisible className="invert" />
                </div>
                {sorteredNavItems.map((item) => (
                  <li
                    className="flex flex-col px-2 flex-1 space-y-2"
                    key={item.section}
                  >
                    <Link
                      href={`/${item.section}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-uiblack hover:underline text-2xl tracking-wider hover:text-uiblack/50 md:hover:scale-105 md:transition-all"
                    >
                      {item.label}
                    </Link>
                    {item.subItems &&
                      item.subItems.map((subItem, index) => (
                        <Link
                          onClick={() => setIsMenuOpen(false)}
                          key={(subItem.href + index) as string}
                          href={`/${item.section}#${subItem.href}`}
                          className="text-uiblack hover:underline text-xs tracking-wider hover:text-uiblack/50 md:hover:scale-105 md:transition-all"
                        >
                          · {subItem.title}
                        </Link>
                      ))}
                  </li>
                ))}
              </div>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <HomePageLogo
        className=" md:hover:scale-110 md:transition-all"
        onClick={() => setIsMenuOpen(true)}
      />
    </nav>
  );
}

export default AnimatedNavMenu;
