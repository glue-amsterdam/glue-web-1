"use client";

import Link from 'next/link';
import BigButton from './big-button'
import { usePathname } from 'next/navigation';

type FooterLink = {
    title: string;
    link: string;
};
const navLinks: FooterLink[] = [
    { title: 'Home', link: '/' },
    { title: 'About', link: '/about' },
    { title: 'Participate', link: '/participate' },
    { title: 'Exhibitors', link: '/participants' },
    { title: 'Map', link: '/map' },
    { title: 'Program', link: '/program' },
];
const helpLinks: FooterLink[] = [
    { title: 'FAQ', link: '/faq' },
    { title: 'Press & Media', link: '/press-media' },
    { title: 'Archive', link: '/archive' },
    { title: 'Contact', link: '/contact' },
    { title: 'Terms & Conditions', link: '/terms-conditions' },
    { title: 'Privacy Policy', link: '/privacy-policy' },
    { title: 'Imprint', link: '/imprint' },
];
const socialLinks: FooterLink[] = [
    { title: 'Instagram', link: 'https://www.instagram.com/glue.amsterdam' },
    { title: 'LinkedIn', link: 'https://www.linkedin.com/company/glue-amsterdam-connected-by-design/' },
    { title: 'Youtube', link: 'https://www.youtube.com/@GLUETV_amsterdam' },
];
const mobileColumns = [
    { title: 'Web Navigation', links: navLinks },
    { title: 'Help & Support', links: helpLinks },
    { title: 'Follow Us', links: socialLinks },
];
const desktopLinkColumns: FooterLink[][] = [
    navLinks.slice(0, 3),   // Home, About, Participate
    navLinks.slice(3),      // Exhibitors, Map, Program
    helpLinks.slice(0, 3),  // FAQ, Press & Media, Archive
    helpLinks.slice(3),     // Contact, Terms, Privacy, Imprint
    socialLinks,            // Instagram, LinkedIn, Youtube
];



function BottomFooter() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    return (
        <footer id='footer' className={`main-padding ${isHome ? 'lg:pb-(--nav-secondary-h-mobile)' : ''}`}>
            <section className="bg-(--black-color) p-[20px] lg:p-[60px] text-(--white-color)">
                <div className='grid grid-cols-3 gap-x-[36px] gap-y-[15px] lg:hidden'>
                    {mobileColumns.map((item) => (
                        <div key={item.title} >
                            <h3 className='sr-only'>{item.title}</h3>
                            <ul className='flex flex-col gap-[15px]'>
                                {item.links.map((link) => (
                                    <li className='text-[10px] leading-[10px]' key={link.title}>
                                        <Link href={link.link}>{link.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <p className='min-[350px]:col-span-2 self-end text-[10px] leading-[10px]'>
                        All rights reserved © 2026 GLUE
                    </p>
                    <div className='self-end justify-self-start'>
                        <BigButton as="link" label="Newsletter" href="/newsletter" mode="footer" fontSize="small" />
                    </div>
                </div>
                <div className="hidden lg:flex lg:justify-between gap-x-[40px]">
                    <div className='grid grid-cols-5 gap-x-[60px] gap-y-[20px]'>
                        {desktopLinkColumns.map((column) => (
                            <div key={column[0].title}>
                                <h3 className='sr-only'>{column[0].title}</h3>
                                <ul className='flex flex-col gap-[15px] lg:gap-[20px]'>
                                    {column.map((link) => (
                                        <Link key={link.title} href={link.link}><li className='text-[12px] leading-[12px] lg:text-[19px] lg:leading-[25px] hover:underline'>{link.title}</li></Link>
                                    ))}
                                </ul>
                            </div>
                        ))}</div>
                    <div></div>
                    <div className='flex flex-col gap-[20px] justify-between'>
                        <div >
                            <BigButton as="link" label="Newsletter" href="/newsletter" mode="footer" fontSize="base" />
                        </div>
                        <p className='text-[12px] leading-[12px] lg:text-[19px] lg:leading-[25px]'>
                            All rights reserved © 2026 GLUE
                        </p>
                    </div>
                </div>

            </section>
        </footer>
    )
}

export default BottomFooter