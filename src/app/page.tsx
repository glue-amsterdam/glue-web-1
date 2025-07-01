"use client";
import Background from "@/app/components/background";
import ClickAreas from "@/app/components/home-page/click-areas";
import { useHomeText } from "@/app/context/MainContext";

export default function Home() {
  const homeText = useHomeText();

  return (
    <>
      <main>
        {homeText && (
          <div className="absolute md:max-w-[50vw] flex justify-center w-full bottom-5 md:top-5 ">
            <h1 className="sr-only">Welcome to GLUE, Connected by Design</h1>
            <p
              style={{ color: homeText.color ?? "#fff" }}
              className="text-white text-2xl font-semibold"
            >
              {homeText.label}
            </p>
          </div>
        )}
        <ClickAreas />
      </main>
      <Background />
    </>
  );
}
