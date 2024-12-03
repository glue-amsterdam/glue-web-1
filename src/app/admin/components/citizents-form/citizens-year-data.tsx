"use client";

import useSWR from "swr";
import { CitizensYearForm } from "./citizens-year-form";
import { fetchCitizensByYear } from "@/utils/api/admin-api-calls";

import { useFormContext, FieldValues } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Citizen } from "@/schemas/citizenSchema";

import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogContent } from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CitizensYearFormWrapperProps {
  selectedYear: string;
  isNewYear: boolean;
}

export default function CitizensYearData({
  selectedYear,
  isNewYear,
}: CitizensYearFormWrapperProps) {
  const { getValues, handleSubmit } = useFormContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetcher = () => fetchCitizensByYear(selectedYear);
  const {
    data: citizens,
    error,
    mutate,
  } = useSWR<Citizen[]>(
    isNewYear ? null : `/api/admin/about/citizens/${selectedYear}`,
    fetcher
  );

  if (error) {
    toast({
      title: "Error",
      description: `Failed to fetch citizens for year ${selectedYear}. Please try again.`,
      variant: "destructive",
    });
  }

  if (!isNewYear && !citizens && !error) {
    return <LoadingSpinner />;
  }

  const displayedCitizens = isNewYear
    ? getValues(`citizensByYear.${selectedYear}`) || []
    : citizens || [];

  const onSubmit = async (data: FieldValues) => {
    try {
      const citizensToSubmit = data.citizensByYear[selectedYear] as Citizen[];

      // Optimistically update the local data
      mutate(citizensToSubmit, false);

      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(citizensToSubmit),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to update citizens for year ${selectedYear}`);

      // Trigger a revalidation to make sure our local data is correct
      mutate();
      router.refresh();
      toast({
        title: "Citizens updated",
        description: `Citizens for year ${selectedYear} have been successfully updated.`,
      });
    } catch (error) {
      console.error(
        `Citizens submission error for year ${selectedYear}:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to update citizens for year ${selectedYear}. Please try again.`,
        variant: "destructive",
      });
      // Revert the optimistic update
      mutate();
    }
  };

  const deleteYear = async () => {
    try {
      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete citizens for year ${selectedYear}`);
      }

      toast({
        title: "Year deleted",
        description: `Citizens for year ${selectedYear} have been successfully deleted.`,
      });

      // Trigger a revalidation of the SWR cache
      mutate();
      router.refresh();
    } catch (error) {
      console.error(`Error deleting year ${selectedYear}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete citizens for year ${selectedYear}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CitizensYearForm
        selectedYear={selectedYear}
        initialCitizens={displayedCitizens}
      />
      <SaveChangesButton
        className="mt-2"
        watchFields={[`citizensByYear.${selectedYear}`]}
      >
        Save Citizens for {selectedYear}
      </SaveChangesButton>
      {!isNewYear && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Year
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className={cn(
              "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
              "w-full max-w-lg rounded-lg p-6 shadow-lg",
              "bg-background"
            )}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                citizens for the year {selectedYear} and remove all associated
                data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteYear}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          {isDeleteDialogOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50"
              aria-hidden="true"
              onClick={() => setIsDeleteDialogOpen(false)}
            />
          )}
        </AlertDialog>
      )}
    </form>
  );
}
