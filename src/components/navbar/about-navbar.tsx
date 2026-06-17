import Link from "next/link";
import type { AboutNavLink } from "@/schemas/aboutPageSchema";

type Props = {
  links: AboutNavLink[];
};

const AboutNavbar = ({ links }: Props) => {
  const visibleLinks = links.filter((link) => link.is_visible);

  if (visibleLinks.length === 0) {
    return null;
  }

  return (
    <nav aria-label="About sections">
      <ul className="flex items-center gap-[40px] base-text-size">
        {visibleLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AboutNavbar;
