"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

function DashboardMenu() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -150 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, type: "keyframes" }}
      className="w-64 bg-uiblack shadow-md"
    >
      <nav className="p-5 space-y-2">
        <Link href="?section=member-data">
          <Button variant="ghost" className="w-full justify-start">
            Member Data
          </Button>
        </Link>
        <Link href="?section=create-events">
          <Button variant="ghost" className="w-full justify-start">
            Create Events
          </Button>
        </Link>
        <Link href="?section=your-events">
          <Button variant="ghost" className="w-full justify-start">
            Your Events
          </Button>
        </Link>
        <Link href="?section=admin-panel">
          <Button variant="ghost" className="w-full justify-start">
            Admin Panel
          </Button>
        </Link>
      </nav>
    </motion.aside>
  );
}

export default DashboardMenu;
