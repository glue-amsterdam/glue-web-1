"use client";

import { useState, useEffect } from "react";
import LoginForm from "./login-form";
import AdminDashboard from "./admin-dashboard";
import { NAVBAR_HEIGHT } from "@/constants";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(true);
  }, []);

  return (
    <div
      className={`min-h-screen pt-[${NAVBAR_HEIGHT}rem] bg-gradient-to-br from-blue-100 to-purple-100`}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">
          GLUE Admin
        </h1>
        {isAdmin ? (
          <>
            <LoginForm />
            <AdminDashboard />
          </>
        ) : null}
      </div>
    </div>
  );
}
