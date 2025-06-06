import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

import UserMenuItems from "./user-menu-items";
import SearchForm from "@/app/components/navbar/search-form";
import { MobileNavMenu } from "@/app/components/navbar/mobile-nav-menu";
import SocialIcons from "@/app/components/navbar/social-icon";
import type { Dispatch, SetStateAction } from "react";
import HomePageLogo from "@/app/components/navbar/home-page-logo";
import { MdMenu } from "react-icons/md";
import type { MainMenuItem } from "@/schemas/mainSchema";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  handleSearch: (query: string) => void;
  navItems: MainMenuItem[];
};

export default function MobileSheet({
  isOpen,
  setIsOpen,
  handleSearch,
  navItems,
}: Props) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTitle className="sr-only">Menu</SheetTitle>
      <SheetTrigger asChild className="md:hidden">
        <MdMenu
          className="size-10 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] sm:w-[400px] overflow-y-scroll flex flex-col text-uiblack"
      >
        <nav className="flex flex-col space-y-4">
          <SheetClose asChild>
            <div onClick={() => setIsOpen(false)}>
              <HomePageLogo />
            </div>
          </SheetClose>
          <SearchForm
            onSearch={handleSearch}
            onSearchComplete={() => setIsOpen(false)}
          />
          <MobileNavMenu navItems={navItems} setIsOpen={setIsOpen} />
          <UserMenuItems setIsOpen={setIsOpen} />
          <div className="pt-4 border-t">
            <SocialIcons />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
