"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  HomeIcon as House,
  Map,
  UserPlus,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PlanType } from "@/schemas/plansSchema";

export default function InsufficientAccess({
  userName,
  userId,
  notes,
}: {
  userName: string;
  userId: string;
  notes?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadPlans = async () => {
    if (plans.length > 0) return;

    setIsLoadingPlans(true);
    try {
      const response = await fetch("/api/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "Failed to load plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const onDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      loadPlans();
    } else {
      setSelectedPlan("");
    }
  };

  const onContinueAction = async () => {
    if (!selectedPlan) {
      toast({
        title: "Plan Required",
        description: "Please select a plan before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPlanData = plans.find(
        (plan) => plan.plan_id === selectedPlan
      );

      const response = await fetch("/api/upgrade-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: selectedPlan,
          plan_type: selectedPlanData?.plan_type || "",
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send upgrade request");
      }

      toast({
        title: "Thank you for your interest!",
        description: `We'll be in touch soon regarding the ${selectedPlanData?.plan_label} plan.`,
      });

      setDialogOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error sending upgrade request:", error);
      toast({
        title: "Error",
        description: "Failed to send upgrade request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            <p>Hello! {userName}</p>
            <p>Insufficient Access</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          </motion.div>
          <motion.article
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>{`Sorry, you don't have sufficient privileges to access profile modification.`}</p>
            <p>{`Visitors and base members can only access the Map to see the routes`}</p>
          </motion.article>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/map")}
                className="flex items-center gap-2 w-full mb-2 bg-green-500 hover:bg-green-500/80"
              >
                <Map className="mr-2" />
                <span className="flex-grow text-center">Go to Map</span>
              </Button>
            </motion.div>
            <AlertDialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
              <AlertDialogTrigger asChild>
                <motion.div
                  className="mb-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="flex items-center gap-2">
                    <UserPlus className="mr-2" />
                    <span className="flex-grow text-center">
                      I want to become a participant
                    </span>
                  </Button>
                </motion.div>
              </AlertDialogTrigger>
              <AlertDialogContent className="text-black max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>{`Become a participant ${userName}`}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {`Want to Become a Participant? Select a plan and click "Continue". A GLUE team member will get in touch with you.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                  <Label htmlFor="plan-select" className="text-sm font-medium">
                    Select a Plan
                  </Label>
                  {isLoadingPlans ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Loading plans...
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={selectedPlan}
                      onValueChange={setSelectedPlan}
                    >
                      <SelectTrigger id="plan-select" className="mt-2">
                        <SelectValue placeholder="Choose a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.plan_id} value={plan.plan_id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {plan.plan_label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onContinueAction}
                    disabled={!selectedPlan || isSubmitting || isLoadingPlans}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 w-full"
              >
                <House className="mr-2" />
                <span className="flex-grow text-center">Back home</span>
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
