import { RouteList } from "@/app/components/dashboard/routes/route-list";
import { RouteProvider } from "@/app/context/RoutesProvider";

export default function RoutesPage() {
  return (
    <RouteProvider>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Available Routes</h1>
        <RouteList />
      </div>
    </RouteProvider>
  );
}
