"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { NAVBAR_HEIGHT } from "@/constants";
import AdminHeader from "./components/admin-header";
import AdminDashboard from "@/app/admin/admin-dashboard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR("/api/admin/check-auth", fetcher, {
    refreshInterval: 20 * 60 * 1000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    if (!isLoading && !error && !data?.isAdmin) {
      router.push("/admin/login");
    }
  }, [data, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading admin status: {error.message}</div>;
  }

  if (!data?.isAdmin) {
    return null; // This will prevent any flash of content before redirect
  }

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="min-h-dvh bg-gradient-to-br from-blue-50 to-white"
    >
      <div className="container mx-auto p-4">
        <AdminHeader adminName={"Admin"} />
        <AdminDashboard />
      </div>
    </div>
  );
}
