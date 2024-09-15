import Lines from "./lines";

function LogoMain({}) {
  return (
    <div className="absolute z-10 size-[90%] mix-blend-lighten">
      <div className="z-10 h-full mainLogo relative">
        <Lines />
        <img
          src="logos/GLUE_G.svg"
          alt="G"
          className="size-32 p-4 md:size-38 lg:size-44 xl:size-50 absolute top-0 left-0 bg-black"
        />
        <img
          src="logos/GLUE_L.svg"
          alt="L"
          className="size-32 p-4 md:size-38 lg:size-44 xl:size-50 absolute top-0 right-0 bg-black"
        />
        <img
          src="logos/GLUE_U.svg"
          alt="U"
          className="size-32 p-4 md:size-38 lg:size-44 xl:size-50 absolute bottom-0 left-0 bg-black"
        />
        <img
          src="logos/GLUE_E.svg"
          alt="E"
          className="size-32 p-4 md:size-38 lg:size-44 xl:size-50 absolute bottom-0 right-0 bg-black"
        />
      </div>
    </div>
  );
}

export default LogoMain;
