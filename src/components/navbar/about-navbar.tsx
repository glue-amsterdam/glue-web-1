import Link from "next/link";
import { ABOUT_ANCHORS, type AboutNavLink } from "@/schemas/aboutPageSchema";

type Props = {
  links: AboutNavLink[];
};

const FAQ_NAV_HREF = `#${ABOUT_ANCHORS.FAQ}`;

const pinFaqLinkLast = (links: AboutNavLink[]): AboutNavLink[] => {
  const faqIndex = links.findIndex((link) => link.href === FAQ_NAV_HREF);
  if (faqIndex < 0 || faqIndex === links.length - 1) {
    return links;
  }

  const reordered = [...links];
  const [faqLink] = reordered.splice(faqIndex, 1);
  reordered.push(faqLink);
  return reordered;
};

const AboutNavbar = ({ links }: Props) => {
  const visibleLinks = pinFaqLinkLast(links.filter((link) => link.is_visible));

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
