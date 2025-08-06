import { config } from "@/env";

export default function ParticipantsPageHeader() {
  return (
    <div className="pb-8 text-center">
      <h1 className="font-lausanne text-4xl uppercase">
        GLUE {config.cityName} - Participants
      </h1>
    </div>
  );
}
