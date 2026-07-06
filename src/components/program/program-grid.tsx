import ProgramCard from "@/components/program/program-card";
import { getProgramItemKey } from "@/lib/program/program-filters";
import type { ProgramListItem } from "@/lib/program/program-types";

type Props = {
  events: ProgramListItem[];
  loading: boolean;
};

const ProgramGrid = ({ events, loading }: Props) => {
  return (
    <ul
      className={`grid w-full grid-cols-1 lg:grid-cols-3 gap-y-[40px] lg:gap-y-[60px] lg:gap-x-[30px] list-none justify-items-center lg:justify-items-start ${loading ? "opacity-60 pointer-events-none" : ""
        }`}
      aria-busy={loading}
    >
      {events.map((event) => (
        <li key={getProgramItemKey(event)} className="w-full min-w-0">
          <ProgramCard event={event} />
        </li>
      ))}
    </ul>
  );
};

export default ProgramGrid;
