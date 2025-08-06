import React from "react";

interface HomeAreaButtonProps {
  label: string;
  section: string;
  className?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
}

const HomeAreaButton: React.FC<HomeAreaButtonProps> = ({
  label,
  section,
  className = "",
  onClick,
  onKeyDown,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      tabIndex={0}
      role="button"
      aria-label={ariaLabel || label}
      aria-labelledby={`label-${section}`}
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <span>{label}</span>
    </button>
  );
};

export default HomeAreaButton;
