import Gletter from "@/app/components/logo-components/g-letter";
import Lletter from "@/app/components/logo-components/l-letter";
import Eletter from "@/app/components/logo-components/e-letter";
import Uletter from "@/app/components/logo-components/u-letter";

function Lines() {
  return (
    <div className="absolute w-full h-[90%] m-auto">
      <div className="absolute inset-0 w-[90%] m-auto h-[90%]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          vectorEffect="non-scaling-stroke"
          className="absolute overflow-visible"
        >
          <polygon
            points="0 0, 100 0, 0 100, 100 100"
            className="stroke-white"
            strokeWidth="0.2"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

function LogoLetters() {
  return (
    <div className="absolute z-20 w-full h-[90%]">
      <div className="h-full relative">
        <Gletter className="absolute top-0 left-0 size-12 lg:size-24  bg-black" />
        <Lletter className="absolute top-0 right-0 size-12 lg:size-24 bg-black" />
        <Uletter className="absolute bottom-0 left-0 size-12 lg:size-24 bg-black" />
        <Eletter className="absolute bottom-0 right-0 size-12 lg:size-24 bg-black" />
      </div>
    </div>
  );
}

export default function StaticLogo() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <LogoLetters />
      <Lines />
    </div>
  );
}
