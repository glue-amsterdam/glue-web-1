import type { YearNumberItem } from "@/lib/year-numbers/fetch-year-numbers-for-year";

type HeadingLevel = "h2" | "h3";

type Props = {
  title: string;
  items: YearNumberItem[];
  sectionId?: string;
  className?: string;
  headingLevel?: HeadingLevel;
};

const YearNumbersSection = ({
  title,
  items,
  sectionId = "year-numbers-section",
  className,
  headingLevel = "h2",
}: Props) => {
  if (items.length === 0) {
    return null;
  }

  const HeadingTag = headingLevel;

  return (
    <section id={sectionId} className={className}>
      <HeadingTag className="title-text mini-padding">{title.toUpperCase()}</HeadingTag>
      <ul className="pt-[40px] lg:pt-[60px] grid grid-cols-2 lg:flex lg:items-center lg:justify-center lg:w-full gap-[20px] lg:gap-[30px] justify-items-center">
        {items.map((item) => (
          <li
            className="flex flex-col items-center lg:min-w-[230px]"
            key={item.label}
          >
            <span className="title-text">{item.value}</span>
            <p className="base-text-size">{item.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default YearNumbersSection;
