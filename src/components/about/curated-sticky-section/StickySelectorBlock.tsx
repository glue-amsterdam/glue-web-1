import Link from "next/link";

export default function StickySelectorBlock({
  years,
  selectedYear,
  setSelectedYear,
  participants,
  bgColor,
  textColor,
}: {
  textColor: string;
  bgColor: string;
  years: number[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  participants: {
    userId: string;
    userName: string;
  }[];
}) {
  const multipleParticipants = [
    ...participants,
    ...participants,
    ...participants,
  ];

  return (
    <div
      data-lenis-prevent={true}
      id="curated-participants-and-selector"
      className="border-r border-white/50 h-full w-full flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      {years.length > 0 && (
        <div className="flex items-center justify-end flex-shrink-0 p-2">
          <div
            style={{ color: textColor }}
            className="flex items-center gap-2 border-b border-white/50"
          >
            <p>Year: </p>
            <div className="relative inline-block">
              <select
                className="text-center tracking-widest font-overpass py-1 px-4 z-10 border-none outline-none pr-8"
                style={{
                  border: "none",
                  outline: "none",
                  appearance: "none",
                  background: bgColor,
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  color: textColor,
                }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                aria-label="Select year"
              >
                {years.map((year) => (
                  <option
                    className="text-center w-full"
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/50"
        style={{
          minHeight: "200px",
          maxHeight: "calc(70vh - 60px)",
        }}
      >
        {participants.length === 0 ? (
          <div
            className="text-center text-sm mt-8"
            style={{ color: textColor }}
          >
            No curated members for this year.
          </div>
        ) : (
          <ul
            id="curated-participants-list"
            className="w-full p-2 overflow-x-hidden flex flex-col gap-1"
            style={{ color: textColor }}
          >
            {multipleParticipants.map((participant, idx) => (
              <Link
                key={participant.userId + idx}
                target="_blank"
                href={`/participants/${participant.userId}`}
                className="text-sm hover:tracking-widest transition-tracking duration-300"
                style={{ color: textColor }}
              >
                <li
                  key={participant.userId + idx}
                  className="relative flex items-center gap-2 p-1"
                >
                  {participant.userName}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
