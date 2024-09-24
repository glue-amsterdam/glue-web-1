import Lines from "./lines";

function LogoMain({}) {
  return (
    <div className="absolute z-10 size-[90%] mix-blend-lighten">
      <div className="z-10 h-full mainLogo relative">
        <Lines />
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
