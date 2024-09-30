import Link from "next/link";
import React from "react";

interface ClickArea {
  label: string;
  section: string;
  className: string;
}

function ClickAreas() {
  const clickAreas: ClickArea[] = [
    {
      label: "dashboard",
      section: "dashboard",
      className: "leftbutton",
    },
    {
      label: "about",
      section: "about",
      className: "upperbutton",
    },
    {
      label: "events",
      section: "events",
      className: "rightbutton",
    },
    {
      label: "map",
      section: "map",
      className: "downbutton",
    },
  ];

  return (
    <nav className="fixed inset-0 z-30">
      <ul>
        {clickAreas.map((area) => (
          <li key={area.section}>
            <Link
              id={area.label}
              className={`${area.className}`}
              href={`/${area.section}`}
            />
          </li>
        ))}
      </ul>
      <Labels clickAreas={clickAreas} />
    </nav>
  );
}

function Labels({ clickAreas }: { clickAreas: ClickArea[] }) {
  return (
    <div className="h-full flex-center pointer-events-none">
      <div className="w-[90%] md:w-[85%] h-[60%] relative">
        <div className="flex items-center h-full w-full absolute">
          <label className="navLabel " htmlFor={clickAreas[0].label}>
            {clickAreas[0].label}
          </label>
          <label
            className="navLabel flex justify-center"
            htmlFor={clickAreas[2].label}
          >
            {clickAreas[2].label}
          </label>
        </div>
        <div className="flex-column items-center h-full w-full absolute">
          <label className="navLabel" htmlFor={clickAreas[1].label}>
            {clickAreas[1].label}
          </label>
          <label
            className="navLabel flex items-end"
            htmlFor={clickAreas[3].label}
          >
            {clickAreas[3].label}
          </label>
        </div>
      </div>
    </div>
  );
}

export default ClickAreas;
