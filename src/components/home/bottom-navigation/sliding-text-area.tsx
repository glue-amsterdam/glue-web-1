"use client"

import { usePathname } from 'next/navigation'



type Props = {}

function SlidingTextArea({ }: Props) {
    const pathname = usePathname()
    const isHomePage = pathname === '/'
    const bannerTexts = [
        "Become part of Amsterdams design route 2026",
        "Become part of Amsterdams design route 2026",
        "Become part of Amsterdams design route 2026",
    ]
    if (!isHomePage) return null
    return (
        <div className="overflow-hidden border-t border-[var(--black-color)] lg:border-t-2 bg-[var(--background-color)] h-[40px] py-2 hidden md:block">
            <div className="flex w-max animate-marquee gap-[50px] pl-[14px]">
                {[...bannerTexts, ...bannerTexts].map((text, index) => (
                    <p
                        key={index}
                        className="text-[var(--primary-color)] whitespace-nowrap text-[23px] leading-[29px] font-[400]"
                    >
                        {text}
                    </p>
                ))}
            </div>
        </div>
    )
}

export default SlidingTextArea