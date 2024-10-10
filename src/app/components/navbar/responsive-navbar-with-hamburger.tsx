"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { MdMenuOpen } from "react-icons/md";
import { CiInstagram, CiLinkedin, CiSearch, CiUser } from "react-icons/ci";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchFormProps {
  onSearch: (query: string) => void;
  onSearchComplete?: () => void;
}

interface NavbarProps {}

export default function NavbarBurguer({}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <nav
      className={`flex items-center h-[15vh] justify-between p-4 z-50 w-full mx-auto gap-4  absolute
    ${
      pathname == "/" ? "md:max-w-[580px] xl:max-w-[800px]" : "max-w-[1400px]"
    } transition-all duration-500`}
    >
      <div
        className={`${
          pathname == "/" ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Link href="/">
          <div className="relative size-16 md:size-20 xl:size-24">
            <Image
              src={"/logos/logo-main.png"}
              alt="GLUE logo, connected by design"
              fill
            />
          </div>
        </Link>
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
        <SheetTrigger asChild className="md:hidden ">
          <Button variant="ghost" size="icon">
            <MdMenuOpen className="size-20" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[400px] flex flex-col text-black"
        >
          <nav className="flex flex-col space-y-4  ">
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
          className="pl-8 text-black"
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
  return (
    <div className="flex space-x-4 justify-center">
      <Link
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <CiInstagram className="size-6" />
      </Link>
      <Link
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <CiLinkedin className="size-6" />
      </Link>
    </div>
  );
}

function UserMenu(): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <CiUser className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href="/login">Log In</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/signup">Sign Up</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenuItems(): JSX.Element {
  return (
    <div className="space-y-2">
      <Link
        href="/login"
        className="block px-2 py-1 hover:bg-accent rounded-md"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="block px-2 py-1 hover:bg-accent rounded-md"
      >
        Sign Up
      </Link>
    </div>
  );
}
