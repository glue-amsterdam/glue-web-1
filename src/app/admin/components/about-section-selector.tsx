"use client";

import { useRouter } from "next/navigation";

const navItems = [
  { name: "Carousel", section: "about-carousel" },
  { name: "Participants", section: "about-participants" },
  { name: "Citizens", section: "about-citizens" },
  { name: "Curated", section: "about-curated" },
  { name: "Info", section: "about-info" },
  { name: "Press", section: "about-press" },
  { name: "International", section: "about-international" },
  { name: "Sponsors", section: "about-sponsors" },
];

interface AboutSectionSelectorProps {
  currentSection: string;
}

export default function AboutSectionSelector({
  currentSection,
}: AboutSectionSelectorProps) {
  const router = useRouter();

  const handleSectionChange = (section: string) => {
    router.push(`?section=${section}`);
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded-lg shadow-inner overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.section}
          onClick={() => handleSectionChange(item.section)}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 ease-in-out
            ${
              currentSection === item.section
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
          `}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
