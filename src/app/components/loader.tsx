import { ImSpinner9 } from "react-icons/im";

export default function CenteredLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
      <div className="relative flex items-center justify-center h-32 w-32">
        <ImSpinner9 className="animate-spin text-uiwhite w-16 h-16" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
