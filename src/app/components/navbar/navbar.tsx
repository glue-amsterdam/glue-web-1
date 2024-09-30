import React from "react";
import { SearchInput } from "./search-input";
import SocialSection from "./social-section";
import NavbarLogo from "./navbar-logo";
import LoginSection from "./login-section";

function NavBar() {
  return (
    <header className="z-50 h-[15%] w-full absolute">
      <nav
        id="top-nav"
        className="flex items-center w-[75%] m-auto justify-around h-full"
      >
        <NavbarLogo />
        <ActionSection />
      </nav>
    </header>
  );
}

function ActionSection() {
  return (
    <div className="flex-1 flex items-center justify-between">
      <SearchInput />
      <SocialSection />
      <LoginSection />
    </div>
  );
}

export default NavBar;
