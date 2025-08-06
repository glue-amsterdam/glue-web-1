import NavBar from "@/components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GLUE Admin Dashboard",
};

function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[var(--color-box2)] h-full min-h-screen">
      <NavBar />
      {children}
    </div>
  );
}

export default AdminLayout;
