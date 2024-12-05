import { NAVBAR_HEIGHT } from "@/constants";
import { AlertCircle } from "lucide-react";

interface NoDataAvailableProps {
  message?: string;
}

export function NoDataAvailable({
  message = "No data available, please try again later",
}: NoDataAvailableProps) {
  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-start relative bg-black/50`}
    >
      <div className="flex flex-col items-center justify-center pt-20 bg-gray-50 rounded-lg shadow-inner">
        <div className="mb-4 text-gray-400">
          <AlertCircle size={48} />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-700">{message}</h2>
        <p className="text-gray-500">{`We're having trouble loading the data. Please check back soon.`}</p>
        <div className="mt-6"></div>
      </div>
    </div>
  );
}
