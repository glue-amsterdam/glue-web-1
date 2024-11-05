"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "./admin-dashboard";
import { NAVBAR_HEIGHT } from "@/constants";
import AdminLoginForm from "@/app/admin/forms/admin-login-form";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(true);
  }, []);

  return (
    <div
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`min-h-dvh bg-gradient-to-br from-blue-100 to-purple-100`}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">
          GLUE Admin
        </h1>
        {isAdmin ? (
          <>
            <AdminLoginForm />
            <AdminDashboard />
          </>
        ) : null}
      </div>
    </div>
  );
}
