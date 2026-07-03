import { cn } from "@/lib/utils";

type MinusIconProps = {
    className?: string;
};

const MinusIcon = ({ className }: MinusIconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="2"
        viewBox="0 0 20 2"
        fill="none"
        aria-hidden="true"
        className={cn("w-5 shrink-0", className)}
    >
        <rect width="15" height="1.5" fill="currentColor" />
    </svg>
);

export default MinusIcon;
