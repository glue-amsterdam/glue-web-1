import LogoMain from "@/app/components/logo-main";
import BackgroundGrid from "./background-grid";

function Background() {
  return (
    <div className="fixed inset-0">
      <LogoMain mode="home" />
      <BackgroundGrid />
    </div>
  );
}

export default Background;
