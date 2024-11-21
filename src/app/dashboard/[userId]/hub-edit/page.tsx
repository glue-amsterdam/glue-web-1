import { HubList } from "@/app/components/dashboard/hub/hub-list";
import { HubProvider } from "@/app/context/HubProvider";

export default function HubsPage() {
  return (
    <HubProvider>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Available Hubs</h1>
        <HubList />
      </div>
    </HubProvider>
  );
}
