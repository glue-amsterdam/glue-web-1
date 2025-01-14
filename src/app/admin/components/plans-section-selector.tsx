"use client";

import { PlanIdType } from "@/schemas/plansSchema";
import Link from "next/link";

const planItems = [
  { name: "Free Plan", planId: "planId-0" },
  { name: "Plan 1", planId: "planId-1" },
  { name: "Plan 2", planId: "planId-2" },
  { name: "Plan 3", planId: "planId-3" },
  { name: "Plan 4", planId: "planId-4" },
  { name: "Plan 5", planId: "planId-5" },
  { name: "Plan 6", planId: "planId-6" },
];

interface PlanSelectorProps {
  currentPlan: PlanIdType;
}

export default function PlanSelector({ currentPlan }: PlanSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded-lg shadow-inner overflow-x-auto">
      {planItems.map((item) => (
        <Link
          key={item.planId}
          href={`?plan=${item.planId}`}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-200 ease-in-out
            ${
              currentPlan === item.planId
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
          `}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
