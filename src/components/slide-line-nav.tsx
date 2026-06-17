type SlideLineNavItem = {
  id: string;
  label: string;
};

type SlideLineNavProps = {
  items: SlideLineNavItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  size?: "default" | "compact";
};

const getNavClassName = (size: "default" | "compact") => {
  if (size === "compact") {
    return "flex justify-center w-full flex-wrap gap-[6px] pt-[10px]";
  }

  return "flex pt-[30px] gap-[15px] justify-center w-full flex-wrap";
};

const getLineButtonClassName = (
  isActive: boolean,
  size: "default" | "compact"
) => {
  const base =
    "h-2 shrink-0 cursor-pointer border-0 border-[var(--black-color)] bg-transparent p-0";

  if (size === "compact") {
    return `${base} w-[36px] ${isActive ? "border-b-[2px]" : "border-b-[1px]"}`;
  }

  return `${base} w-[90px] lg:w-[150px] ${isActive
    ? "border-b-[3px] lg:border-b-[4px]"
    : "border-b-[1px] lg:border-b-[2px]"
    }`;
};

const SlideLineNav = ({
  items,
  currentIndex,
  onSelect,
  ariaLabel,
  size = "default",
}: SlideLineNavProps) => {
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav aria-label={ariaLabel} className={getNavClassName(size)}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          aria-current={index === currentIndex}
          aria-label={item.label}
          onClick={() => onSelect(index)}
          className={getLineButtonClassName(index === currentIndex, size)}
        />
      ))}
    </nav>
  );
};

export default SlideLineNav;
