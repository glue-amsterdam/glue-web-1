"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import {
  useFormContext,
  useFieldArray,
  type FieldValues,
} from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import type { Citizen, CitizensSection } from "@/schemas/citizenSchema";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import LoadingSpinner from "@/app/components/LoadingSpinner";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { fetchCitizensByYear } from "@/lib/about/fetch-citizens-section";
import { AboutCitizenYearForm } from "./AboutCitizenYearForm";

interface CitizensYearDataProps {
  selectedYear: string;
  isNewYear: boolean;
}

export default function AboutCitizenYearData({
  selectedYear,
  isNewYear,
}: CitizensYearDataProps) {
  const { control, handleSubmit, setValue, getValues } =
    useFormContext<CitizensSection>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `citizensByYear.${selectedYear}`,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- NUEVO
  const { toast } = useToast();
  const router = useRouter();

  const fetcher = useCallback(
    () => fetchCitizensByYear(selectedYear),
    [selectedYear]
  );
  const {
    data: citizens,
    error,
    mutate,
  } = useSWR<Citizen[]>(
    isNewYear ? null : `/api/admin/about/citizens/${selectedYear}`,
    fetcher
  );

  useEffect(() => {
    if (citizens && !isSubmitting) {
      // <-- Solo actualiza si NO está submitteando
      const sortedCitizens = [...citizens].sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      setValue(`citizensByYear.${selectedYear}`, sortedCitizens);
    }
  }, [citizens, selectedYear, setValue, isSubmitting]);

  if (error) {
    toast({
      title: "Error",
      description: `Failed to fetch citizens for year ${selectedYear}. Please try again.`,
      variant: "destructive",
    });
  }

  console.log(fields);

  const handleAddCitizen = useCallback(() => {
    if (fields.length < 4) {
      const newCitizen: Citizen = {
        id: `${selectedYear}-${Date.now()}-${fields.length + 1}`,
        section_id: "about-citizens-section",
        name: "",
        image_url: "",
        description: "",
        year: selectedYear,
      };
      append(newCitizen);
    } else {
      toast({
        title: "Maximum citizens reached",
        description: "You can't add more than 4 citizens per year.",
        variant: "destructive",
      });
    }
  }, [fields.length, selectedYear, append, toast]);

  const handleRemoveCitizen = useCallback(
    (index: number) => {
      if (index === fields.length - 1) {
        remove(index);
        setTimeout(() => {
          const currentCitizens = (
            getValues(`citizensByYear.${selectedYear}`) as Citizen[]
          ).filter(Boolean);
          setValue(`citizensByYear.${selectedYear}`, currentCitizens);
          mutate(currentCitizens, false); // <-- Actualiza SWR también
          console.log("After remove, citizens:", currentCitizens);
        }, 0);
      } else {
        toast({
          title: "Cannot remove citizen",
          description: "Only the last citizen can be removed.",
          variant: "destructive",
        });
      }
    },
    [fields.length, remove, toast, setValue, selectedYear, getValues, mutate]
  );

  const onSubmit = async (data: FieldValues) => {
    console.log("onSubmit called", data);
    setIsSubmitting(true); // <-- Inicia submit
    try {
      const citizensToSubmit = data.citizensByYear[selectedYear] as Citizen[];

      if (citizensToSubmit.length < 3 || citizensToSubmit.length > 4) {
        toast({
          title: "Invalid number of citizens",
          description: "You must have 3 or 4 citizens per year.",
          variant: "destructive",
        });
        setIsSubmitting(false); // <-- Finaliza submit
        return;
      }

      // Prepare citizens data for submission
      const preparedCitizens = citizensToSubmit.map((citizen, index) => ({
        ...citizen,
        id: citizen.id.startsWith(selectedYear)
          ? `${selectedYear}-${Date.now()}-${index + 1}`
          : citizen.id,
        oldImageUrl: citizen.oldImageUrl || citizen.image_url, // Preserve the old image URL
      }));

      // Sort citizens by their IDs to maintain order
      preparedCitizens.sort((a, b) => a.id.localeCompare(b.id));

      // Optimistically update the local data
      mutate(preparedCitizens, false);

      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preparedCitizens),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to update citizens for year ${selectedYear}`);

      const result = await response.json();

      // Update the form and SWR with the new data from the server
      setValue(`citizensByYear.${selectedYear}`, result.citizens);
      mutate(result.citizens, false); // <-- fuerza a SWR a tener la data correcta

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
    } finally {
      setIsSubmitting(false); // <-- Finaliza submit SIEMPRE
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

  if (!isNewYear && !citizens && !error) {
    return <LoadingSpinner />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log("Submit errors:", errors);
      })}
    >
      <AboutCitizenYearForm
        selectedYear={selectedYear}
        onAddCitizen={handleAddCitizen}
        onRemoveCitizen={handleRemoveCitizen}
        fields={fields}
      />
      <SaveChangesButton
        className="mt-4"
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
              "bg-background text-black"
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
