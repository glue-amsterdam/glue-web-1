"use client";

import { useState } from "react";
import type { PlanType } from "@/schemas/plansSchema";

import {
  deletePlan,
  updatePlan,
  createPlan,
  updatePlanOrder,
} from "@/app/actions/plans";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import PlanEditDialog from "./PlanEditDialog";
import PlanAddDialog from "./PlanAddDialog";

interface PlansListProps {
  initialPlans: PlanType[];
}

export default function PlansList({ initialPlans }: PlansListProps) {
  const [plans, setPlans] = useState(
    initialPlans.sort((a, b) => a.order_by - b.order_by)
  );
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const { toast } = useToast();

  const handleEdit = (plan: PlanType) => {
    setEditingPlan(plan);
  };

  const movePlan = async (planId: string, direction: "up" | "down") => {
    const planIndex = plans.findIndex((p) => p.plan_id === planId);
    if (
      (direction === "up" && planIndex === 0) ||
      (direction === "down" && planIndex === plans.length - 1)
    ) {
      return; // Can't move further
    }

    const newPlans = [...plans];
    const swapIndex = direction === "up" ? planIndex - 1 : planIndex + 1;

    const oldOrder = newPlans[planIndex].order_by;
    const newOrder = newPlans[swapIndex].order_by;

    // Swap order_by values
    newPlans[planIndex].order_by = newOrder;
    newPlans[swapIndex].order_by = oldOrder;

    // Swap positions in array
    [newPlans[planIndex], newPlans[swapIndex]] = [
      newPlans[swapIndex],
      newPlans[planIndex],
    ];

    setPlans(newPlans);

    // Update order in database
    try {
      await updatePlanOrder(planId, newOrder, oldOrder);
    } catch (error) {
      console.error("Failed to update plan order:", error);
      toast({
        title: "Error",
        description: "Failed to update plan order. Please try again.",
        variant: "destructive",
      });
      // Revert the changes in the local state if the database update fails
      setPlans(plans);
    }
  };

  const handleDelete = async (planId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this plan?"
    );
    if (confirmed) {
      try {
        const planToDelete = plans.find((p) => p.plan_id === planId);
        if (!planToDelete) return;

        await deletePlan(planId);

        // Update local state with correct order_by values
        const updatedPlans = plans
          .filter((p) => p.plan_id !== planId)
          .map((p) => {
            if (p.order_by > planToDelete.order_by) {
              return { ...p, order_by: p.order_by - 1 };
            }
            return p;
          });

        setPlans(updatedPlans);

        toast({
          title: "Plan deleted",
          description: "The plan has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the plan. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = (updatedPlan: PlanType) => {
    setPlans(
      plans.map((p) => (p.plan_id === updatedPlan.plan_id ? updatedPlan : p))
    );
    setEditingPlan(null);
  };

  const handleToggleParticipant = async (planId: string, newValue: boolean) => {
    try {
      const planToUpdate = plans.find((p) => p.plan_id === planId);
      if (planToUpdate) {
        const updatedPlan = await updatePlan({
          ...planToUpdate,
          is_participant_enabled: newValue,
        });
        setPlans(plans.map((p) => (p.plan_id === planId ? updatedPlan : p)));
        toast({
          title: "Plan updated",
          description: `Participant enrollment ${
            newValue ? "enabled" : "disabled"
          } for ${updatedPlan.plan_label}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPlan = async (
    newPlan: Omit<PlanType, "plan_id" | "order_by">
  ) => {
    try {
      const createdPlan = await createPlan(newPlan);
      setPlans([...plans, createdPlan]);
      setIsAddingPlan(false);
      toast({
        title: "Plan created",
        description: `${createdPlan.plan_label} has been successfully created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPlanTypeColor = (planType: string) => {
    switch (planType) {
      case "free":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-purple-500/10 text-purple-500";
      case "participant":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray/10 text-gray";
    }
  };

  return (
    <div>
      <Button onClick={() => setIsAddingPlan(true)} className="mb-4">
        Add New Plan
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Allowed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.plan_id}>
              <TableCell className="flex items-center gap-2">
                <span className="">Nº {plan.order_by}</span>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => movePlan(plan.plan_id, "up")}
                  disabled={plan.order_by === 1}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => movePlan(plan.plan_id, "down")}
                  disabled={plan.order_by === plans.length}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>{plan.plan_label}</TableCell>
              <TableCell>
                <Badge className={getPlanTypeColor(plan.plan_type)}>
                  {plan.plan_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={plan.is_participant_enabled}
                    onCheckedChange={(checked) =>
                      handleToggleParticipant(plan.plan_id, checked)
                    }
                    className={cn(
                      "peer inline-flex h-[24px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    )}
                  ></Switch>
                </div>
              </TableCell>
              <TableCell className="flex flex-wrap gap-2">
                <Button onClick={() => handleEdit(plan)} className="mr-2">
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(plan.plan_id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingPlan && (
        <PlanEditDialog
          plan={editingPlan}
          onSave={handleSave}
          onClose={() => setEditingPlan(null)}
        />
      )}
      {isAddingPlan && (
        <PlanAddDialog
          onSave={handleAddPlan}
          onClose={() => setIsAddingPlan(false)}
        />
      )}
    </div>
  );
}
