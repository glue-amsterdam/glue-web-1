"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { NAVBAR_HEIGHT } from "@/constants";
import AdminLoginForm from "@/app/admin/login/admin-login-form";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminLoginPage() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR("/api/admin/check-auth", fetcher, {
    revalidateOnFocus: true,
    revalidateIfStale: true,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    if (error || (data && !data.isAdmin)) {
      router.replace("/admin/login");
    } else if (data?.isAdmin) {
      router.replace("/admin");
    }
  }, [data, error, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error checking admin status</div>;
  }

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="bg-gradient-to-br from-blue-50 to-white flex items-center justify-center pt-20"
    >
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">
          GLUE Admin Login
        </h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
