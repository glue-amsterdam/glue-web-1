type SlideLineNavItem = {
  id: string;
  label: string;
};

type SlideLineNavProps = {
  items: SlideLineNavItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  ariaLabel: string;
  size?: "default" | "compact" | "desktop";
};

const getNavClassName = (size: "default" | "compact" | "desktop") => {
  if (size === "compact") {
    return "mx-auto flex w-full max-w-[200px] flex-nowrap justify-center gap-[6px] pt-[10px]";
  }

  return "mx-auto flex w-full max-w-[300px] flex-nowrap justify-center gap-[15px] pt-[30px] lg:max-w-[480px]";
};

const getLineButtonClassName = (
  isActive: boolean,
  size: "default" | "compact" | "desktop"
) => {
  const base =
    "h-2 min-w-0 flex-1 cursor-pointer border-0 border-[var(--black-color)] bg-transparent p-0";

  if (size === "compact") {
    return `${base} max-w-[36px] ${isActive
      ? "border-b-[3px] lg:border-b-[4px]"
      : "border-b-[1px] lg:border-b-[2px]"
      }`;
  }

  if (size === "desktop") {
    return `${base} max-w-[90px] lg:max-w-[150px] ${isActive
      ? "border-b-[3px] lg:border-b-[4px]"
      : "border-b-[1px] lg:border-b-[2px]"
      }`;
  }

  return `${base} max-w-[90px] lg:max-w-[150px] ${isActive
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
