import LogoMain from "@/app/components/logo-main";
import BackgroundGrid from "./background-grid";

function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <LogoMain mode="home" />
      <BackgroundGrid />
    </div>
  );
}

export default Background;
