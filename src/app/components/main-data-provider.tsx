import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";
import { fetchMain } from "@/utils/api/main-api-calls";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mainColors, mainLinks, mainMenu, eventsDays } = await fetchMain();

  return (
    <MainContextProvider
      mainColors={mainColors}
      mainLinks={mainLinks}
      mainMenu={mainMenu}
      eventsDays={eventsDays}
    >
      <ColorStyleProvider colors={{ ...mainColors }}>
        {children}
      </ColorStyleProvider>
    </MainContextProvider>
  );
}
