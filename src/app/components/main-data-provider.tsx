import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";
import { getData } from "@/lib/main/getData";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await getData();
  return (
    <MainContextProvider
      mainColors={initialData.mainColors}
      mainLinks={initialData.mainLinks}
      mainMenu={initialData.mainMenu}
      eventDays={initialData.eventDays}
    >
      <ColorStyleProvider colors={{ ...initialData.mainColors }}>
        {children}
      </ColorStyleProvider>
    </MainContextProvider>
  );
}
