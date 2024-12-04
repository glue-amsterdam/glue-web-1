import { Suspense } from "react";
import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";
import { getData } from "@/lib/main/getData";
import { LoadingFallback } from "@/app/layout";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await getData();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MainContextProvider initialData={initialData}>
        <ColorStyleProvider colors={initialData.mainColors}>
          {children}
        </ColorStyleProvider>
      </MainContextProvider>
    </Suspense>
  );
}
