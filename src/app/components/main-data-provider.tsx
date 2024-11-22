import { fetchMain } from "@/utils/api";
import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainSection = await fetchMain();

  return (
    <MainContextProvider
      mainColors={mainSection.mainColors}
      mainLinks={mainSection.mainLinks}
      mainMenu={mainSection.mainMenu}
      eventsDays={mainSection.eventsDays}
    >
      <ColorStyleProvider colors={{ ...mainSection.mainColors }}>
        {children}
      </ColorStyleProvider>
    </MainContextProvider>
  );
}
