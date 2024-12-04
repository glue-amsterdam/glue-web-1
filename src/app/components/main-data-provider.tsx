import { MainContextProvider } from "@/app/context/MainContext";
import { getData } from "@/lib/main/getData";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await getData();
  return (
    <MainContextProvider initialData={initialData}>
      {children}
    </MainContextProvider>
  );
}
