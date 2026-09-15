import { Suspense } from "react";
import { loadMapPageData } from "@/lib/map/fetch-map-data";
import MainContainer from "@/components/main-container";
import MapNavbar from "@/components/navbar/map-navbar";

type MapLayoutProps = {
  children: React.ReactNode;
};

const MapLayout = async ({ children }: MapLayoutProps) => {
  const { initialData } = await loadMapPageData();

  return (
    <main>
      <div className="fixed lg:top-(--nav-primary-h) top-(--nav-total-h-mobile) left-0 right-0 z-50 w-full">
        <MainContainer>
          <Suspense fallback={null}>
            <MapNavbar initialRoutes={initialData.routes} />
          </Suspense>
        </MainContainer>
      </div>
      {children}
    </main>
  );
};

export default MapLayout;
