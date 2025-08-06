import { ImSpinner9 } from "react-icons/im";

export default function CenteredLoader() {
  return (
    <div className="w-full h-full z-30 relative mt-4 overflow-hidden">
      <ImSpinner9 className="animate-spin size-10 mx-auto " />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
