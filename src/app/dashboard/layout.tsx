import Background from "@/app/components/background";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      {children}
      <div className="fixed inset-0 overflow-x-hidden overflow-y-scroll -z-10">
        <Background />
      </div>
    </main>
  );
}
