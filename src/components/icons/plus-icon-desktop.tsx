import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const PlusIconDesktop = ({ className }: Props) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <line x1="6.25" y1="-4.37114e-08" x2="6.25" y2="12" stroke="black" strokeWidth="2" />
    <line x1="12" y1="6" y2="6" stroke="black" strokeWidth="2" />
  </svg>
);

export default PlusIconDesktop;
