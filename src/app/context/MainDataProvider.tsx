import { Suspense } from "react";
import { MainContextProvider } from "@/app/context/MainContext";
import { ColorStyleProvider } from "@/app/components/color-style-provider";
import { LoadingFallback } from "@/app/layout";
import { fetchMain } from "@/lib/main/fetch-main";

export async function MainDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await fetchMain();
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
