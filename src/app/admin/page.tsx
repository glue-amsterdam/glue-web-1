"use client";

import { useState, useEffect } from "react";
import LoginForm from "./login-form";
import AdminDashboard from "./admin-dashboard";

export default function AdminPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">
          GLUE Admin
        </h1>
        {isClient ? (
          <>
            <LoginForm />
            <AdminDashboard />
          </>
        ) : null}
      </div>
    </div>
  );
}
