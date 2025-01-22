"use client";

import { useState } from "react";
import type { PlanType } from "@/schemas/plansSchema";

import { deletePlan, updatePlan, createPlan } from "@/app/actions/plans";
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
import PlanEditDialog from "@/app/admin/plans/plan-edit-dialog";
import PlanAddDialog from "@/app/admin/plans/plan-add-dialog";
import { cn } from "@/lib/utils";

interface PlansListProps {
  initialPlans: PlanType[];
}

export default function PlansList({ initialPlans }: PlansListProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const { toast } = useToast();

  const handleEdit = (plan: PlanType) => {
    setEditingPlan(plan);
  };

  const handleDelete = async (planId: string) => {
    if (planId === plans[plans.length - 1].plan_id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this plan?"
      );
      if (confirmed) {
        try {
          await deletePlan(planId);
          setPlans(plans.filter((p) => p.plan_id !== planId));
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

  const handleAddPlan = async (newPlan: Omit<PlanType, "plan_id">) => {
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

  const isFixedPlan = (planId: string) =>
    planId === "planId-0" || planId === "planId-1";

  return (
    <div>
      <Button onClick={() => setIsAddingPlan(true)} className="mb-4">
        Add New Plan
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Allowed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.plan_id}>
              <TableCell>{plan.plan_id}</TableCell>
              <TableCell>{plan.plan_label}</TableCell>

              <TableCell>
                {!isFixedPlan(plan.plan_id) && (
                  <div className="flex items-centerspace-x-2">
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
                )}
              </TableCell>
              <TableCell className="flex flex-wrap gap-2">
                {!isFixedPlan(plan.plan_id) && (
                  <Button
                    onClick={() => handleDelete(plan.plan_id)}
                    disabled={
                      isFixedPlan(plan.plan_id) ||
                      plan.plan_id !== plans[plans.length - 1].plan_id
                    }
                    variant="destructive"
                  >
                    Delete
                  </Button>
                )}
                <Button onClick={() => handleEdit(plan)} className="mr-2">
                  Edit
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
