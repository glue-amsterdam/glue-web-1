"use client";

import Link from "next/link";
import BigButton from "./big-button";
import { usePathname } from "next/navigation";
import type { FooterAboutLink } from "@/lib/about/build-navbar";
import type { LinkItem } from "@/schemas/mainSchema";

type FooterLink = {
  title: string;
  link: string;
};

type BottomFooterProps = {
  mainLinks: LinkItem[];
  aboutLinks: FooterAboutLink[];
};

const blogLink: FooterLink = { title: "Blog", link: "/posts" };

const navLinks: FooterLink[] = [
  { title: "Home", link: "/" },
  { title: "About", link: "/about" },
  { title: "Participate", link: "/participate" },
  { title: "Exhibitors", link: "/exhibitors" },
  { title: "Map", link: "/map" },
  { title: "Program", link: "/program" },
];
const fixedHelpLinks: FooterLink[] = [
  { title: "Contact", link: "/contact" },
  { title: "Terms & Conditions", link: "/terms-and-conditions" },
  { title: "Privacy Policy", link: "/privacy-policy" },
  { title: "Imprint", link: "/imprint" },
];

const SOCIAL_LINK_ORDER = ["instagram", "linkedin", "youtube"] as const;

const FOOTER_ABOUT_ORDER = ["faq", "press-media", "archive"] as const;

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "Youtube",
};

const isHttpUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://");

const sortFooterAboutLinks = (links: FooterAboutLink[]): FooterAboutLink[] => {
  const order = new Map<string, number>(
    FOOTER_ABOUT_ORDER.map((anchor, i) => [anchor, i])
  );
  const getAnchor = (link: string) => link.split("#")[1] ?? "";
  return [...links].sort(
    (a, b) =>
      (order.get(getAnchor(a.link)) ?? 99) -
      (order.get(getAnchor(b.link)) ?? 99)
  );
};

const buildSocialLinks = (mainLinks: LinkItem[]): FooterLink[] =>
  SOCIAL_LINK_ORDER.flatMap((platform) => {
    const item = mainLinks.find(
      (m) =>
        m.platform.toLowerCase() === platform &&
        isHttpUrl(m.link?.trim() ?? "")
    );
    if (!item) return [];
    return [{ title: platformLabels[platform], link: item.link }];
  });

function BottomFooter({ mainLinks, aboutLinks }: BottomFooterProps) {
  const pathname = usePathname();
  const orderedAboutLinks = sortFooterAboutLinks(aboutLinks);
  const socialLinks = buildSocialLinks(mainLinks);
  const isHome = pathname === "/";

  const mobileColumns = [
    { title: "Web Navigation", links: navLinks },
    {
      title: "Help & Support",
      links: [blogLink, ...orderedAboutLinks, ...fixedHelpLinks],
    },
    ...(socialLinks.length > 0
      ? [{ title: "Follow Us", links: socialLinks }]
      : []),
  ];
  const desktopLinkColumns: FooterLink[][] = [
    navLinks.slice(0, 3),
    navLinks.slice(3),
    [blogLink, ...orderedAboutLinks],
    fixedHelpLinks,
    ...(socialLinks.length > 0 ? [socialLinks] : []),
  ];

  return (
    <footer
      id="footer"
      className={`main-padding ${isHome ? "md:pb-(--nav-secondary-h-mobile)" : ""}`}
    >
      <section className="bg-(--black-color) p-[20px] lg:p-[60px] text-(--white-color)">
        <div className="grid grid-cols-3 gap-x-[36px] gap-y-[15px] lg:hidden">
          {mobileColumns.map((item) => (
            <div key={item.title}>
              <h3 className="sr-only">{item.title}</h3>
              <ul className="flex flex-col gap-[15px]">
                {item.links.map((link) => (
                  <li
                    className="text-[10px] leading-[10px]"
                    key={link.title}
                  >
                    <Link href={link.link}>{link.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="min-[350px]:col-span-2 self-end text-[10px] leading-[10px]">
            All rights reserved © 2026 GLUE
          </p>
          <div className="self-end justify-self-start">
            <BigButton
              as="link"
              label="Newsletter"
              href="/newsletter"
              mode="footer"
              fontSize="small"
            />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-between gap-x-[40px]">
          <div className="grid grid-cols-5 gap-x-[60px] gap-y-[20px]">
            {desktopLinkColumns.map((column) => (
              <div key={column[0].title}>
                <h3 className="sr-only">{column[0].title}</h3>
                <ul className="flex flex-col gap-[15px] lg:gap-[20px]">
                  {column.map((link) => (
                    <Link key={link.title} href={link.link}>
                      <li className="footer-text">
                        {link.title}
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div></div>
          <div className="flex flex-col gap-[20px] justify-between">
            <div>
              <BigButton
                as="link"
                label="Newsletter"
                href="/newsletter"
                mode="footer"
                fontSize="base"
              />
            </div>
            <p className="text-[12px] leading-[12px] lg:text-[19px] lg:leading-[25px]">
              All rights reserved © 2026 GLUE
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default BottomFooter;
