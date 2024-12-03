import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";
import { fetchMain, getMockData } from "@/utils/api/main-api-calls";
import { MainSectionData } from "@/schemas/mainSchema";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  let data: MainSectionData;

  try {
    data = await fetchMain();
  } catch (error) {
    console.error("Error fetching main data in Provider:", error);

    data = {
      mainColors: getMockData().mainColors,
      mainLinks: getMockData().mainLinks,
      mainMenu: getMockData().mainMenu,
      eventDays: getMockData().eventDays,
    };
  }
  return (
    <MainContextProvider
      mainColors={data.mainColors}
      mainLinks={data.mainLinks}
      mainMenu={data.mainMenu}
      eventDays={data.eventDays}
    >
      <ColorStyleProvider colors={{ ...data.mainColors }}>
        {children}
      </ColorStyleProvider>
    </MainContextProvider>
  );
}
