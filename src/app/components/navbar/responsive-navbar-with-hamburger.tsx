"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { MdMenuOpen } from "react-icons/md";
import { CiInstagram, CiLinkedin, CiSearch } from "react-icons/ci";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import UserMenu from "./user-menu";
import UserMenuItems from "./user-menu-items";
import GlueLogoSVG from "@/app/components/glue-logo-svg";
import { useLinks } from "@/app/context/MainContext";
/* import BackButton from "@/app/components/navbar/back-button"; */

interface SearchFormProps {
  onSearch: (query: string) => void;
  onSearchComplete?: () => void;
}

export default function NavbarBurger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
    <header className="w-full z-50 relative h-[15vh]">
      <motion.div
        className="absolute inset-0 z-0"
        initial={false}
        animate={{
          backgroundColor: isVisible ? "#2b2b2b" : "transparent",
          translateY: isVisible ? "0%" : "-100%",
        }}
        transition={{ duration: 0.3 }}
      />

      <div
        className={`relative h-full z-10 mx-auto  ${
          !isVisible ? "md:max-w-[580px] xl:max-w-[800px]" : "max-w-[1400px]"
        } transition-all duration-500`}
      >
        <nav className="flex items-center h-full justify-between p-4 w-full gap-4">
          <div
            className={`${
              !isVisible ? "opacity-0 pointer-events-none" : "opacity-100"
            } flex`}
          >
            <Link href="/">
              <div className="relative size-20 md:size-24 xl:size-28">
                <GlueLogoSVG
                  isVisible={isVisible}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </Link>
            {/*  <BackButton /> */}
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-grow justify-center">
            <SearchForm
              onSearch={handleSearch}
              onSearchComplete={() => setIsOpen(false)}
            />
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <SocialIcons />
            <UserMenu />
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MdMenuOpen className="size-20" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] flex flex-col text-uiblack"
            >
              <nav className="flex flex-col space-y-4">
                <SheetClose asChild>
                  <Link href="/">Home</Link>
                </SheetClose>
                <SearchForm
                  onSearch={handleSearch}
                  onSearchComplete={() => setIsOpen(false)}
                />
                <UserMenuItems />
              </nav>
              <div className="mt-10 pt-4 border-t">
                <SocialIcons />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}

function SearchForm({
  onSearch,
  onSearchComplete,
}: SearchFormProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchQuery);
    onSearchComplete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchQuery);
      onSearchComplete?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray">
      <div className="relative">
        <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-8 text-uiblack"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </div>
    </form>
  );
}

function SocialIcons(): JSX.Element {
  const links = useLinks();

  const instagramLink = links?.instagram?.link || "https://instagram.com";
  const linkedinLink = links?.linkedin?.link || "https://linkedin.com";

  return (
    <div className="flex space-x-4 justify-center">
      <Link href={instagramLink} target="_blank" rel="noopener noreferrer">
        <CiInstagram className="size-6" />
      </Link>
      <Link href={linkedinLink} target="_blank" rel="noopener noreferrer">
        <CiLinkedin className="size-6" />
      </Link>
    </div>
  );
}
