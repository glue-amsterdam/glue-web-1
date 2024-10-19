import { ImSpinner9 } from "react-icons/im";

export default function CenteredLoader() {
  return (
    <div className="w-full h-full z-[99] relative mt-4">
      <ImSpinner9 className="animate-spin size-10 mx-auto " />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
