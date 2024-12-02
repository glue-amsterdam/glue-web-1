import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";
import { fetchMain } from "@/utils/api/main-api-calls";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { mainColors, mainLinks, mainMenu, eventDays } = await fetchMain();

    return (
      <MainContextProvider
        mainColors={mainColors}
        mainLinks={mainLinks}
        mainMenu={mainMenu}
        eventDays={eventDays}
      >
        <ColorStyleProvider colors={{ ...mainColors }}>
          {children}
        </ColorStyleProvider>
      </MainContextProvider>
    );
  } catch (error) {
    console.error("Error fetching main data:", error);
    // Provide fallback data or UI
    return <div>Error loading application data</div>;
  }
}
