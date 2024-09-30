function LogoMain({}) {
  return (
    <div className="mix-blend-lighten z-10 absolute inset-0 flex justify-center items-center">
      <LogoLetters />
      <Lines />
    </div>
  );
}

function Lines() {
  return (
    <div className="absolute w-full h-[80%]">
      <div className="absolute inset-0 w-[90%] m-auto h-[90%]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          vectorEffect="none-scaling-stroke"
          className="absolute overflow-visible"
        >
          <polygon
            points="0 0, 100 0, 0 100, 100 100"
            className="stroke-white"
            strokeWidth="0.2"
            fill="none"
          ></polygon>
        </svg>
      </div>
    </div>
  );
}

function LogoLetters() {
  return (
    <div className="absolute z-10 w-[95%] h-[90%]">
      <div className="h-full relative">
        <img
          src="logos/GLUE_G.svg"
          alt="G"
          className="mainLogoLetter top-0 left-0"
        />
        <img
          src="logos/GLUE_L.svg"
          alt="L"
          className="mainLogoLetter top-0 right-0"
        />
        <img
          src="logos/GLUE_U.svg"
          alt="U"
          className="mainLogoLetter bottom-0 left-0"
        />
        <img
          src="logos/GLUE_E.svg"
          alt="E"
          className="mainLogoLetter bottom-0 right-0"
        />
      </div>
    </div>
  );
}

export default LogoMain;
