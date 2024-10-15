import { fetchMainMenu } from "@/utils/api";
import { MainMenu } from "@/utils/menu-types";
import Link from "next/link";
import React, { Suspense } from "react";

async function ClickAreas() {
  const clickAreas = await fetchMainMenu();
  return (
    <Suspense>
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
    </Suspense>
  );
}

function Labels({ clickAreas }: { clickAreas: MainMenu[] }) {
  return (
    <div className="h-full flex justify-center items-center pointer-events-none">
      <div className="w-[90%] md:w-[85%] h-[60%] relative">
        <div className="flex items-center justify-evenly h-full w-full absolute ">
          <div className="w-[12vh] md:w-[30vw]">
            <label
              className="navLabel break-words "
              htmlFor={clickAreas[0].label}
            >
              {clickAreas[0].label}
            </label>
          </div>
          <label
            className="navLabel break-words flex justify-end"
            htmlFor={clickAreas[2].label}
          >
            {clickAreas[2].label}
          </label>
        </div>
        <div className="flex flex-col items-center h-full w-full absolute">
          <label className="navLabel break-words" htmlFor={clickAreas[1].label}>
            {clickAreas[1].label}
          </label>
          <label
            className="navLabel break-words flex items-end"
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
