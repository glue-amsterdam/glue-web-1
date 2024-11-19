import MultiStepForm from "@/app/signup/multi-step-form";
import { NAVBAR_HEIGHT } from "@/constants";

function SignUpPage() {
  return (
    <div className="min-h-screen bg-black">
      <div
        className="pt-[var(--navbar-height)] min-h-screen flex flex-col"
        style={
          {
            "--navbar-height": `${NAVBAR_HEIGHT}rem`,
          } as React.CSSProperties
        }
      >
        <main className="flex-grow container mx-auto px-4">
          <MultiStepForm />
        </main>
      </div>
    </div>
  );
}

export default SignUpPage;