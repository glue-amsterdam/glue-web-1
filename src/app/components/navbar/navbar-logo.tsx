"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavbarLogo() {
  const pathname = usePathname();
  return (
    <div className="flex-1">
      <div className={`${pathname == "/" ? "hidden" : "block"}`}>
        <Link className="flex" href="/">
          <Image
            src={"/logos/logo-main.png"}
            alt="GLUE logo, connected by design"
            width={100}
            height={100}
          />
        </Link>
      </div>
    </div>
  );
}

export default NavbarLogo;
