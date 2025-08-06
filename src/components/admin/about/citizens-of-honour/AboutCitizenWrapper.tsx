"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { generateAltText } from "@/lib/utils";
import { AboutCitizenModal } from "./AboutCitizenModal";
import type { Citizen } from "@/schemas/citizenSchema";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface AboutCitizenWrapperProps {
  selectedYear: string;
  isNewYear: boolean;
  onYearDeleted?: () => void;
}

export function AboutCitizenWrapper({
  selectedYear,
  isNewYear,
  onYearDeleted,
}: AboutCitizenWrapperProps) {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const { toast } = useToast();

  const fetchCitizens = useCallback(async () => {
    if (isNewYear) {
      setCitizens([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/about/citizens/${selectedYear}`);
      if (!response.ok) {
        throw new Error("Failed to fetch citizens");
      }
      const data = await response.json();
      setCitizens(data.citizens || []);
    } catch (error) {
      console.error("Error fetching citizens:", error);
      toast({
        title: "Error",
        description: "Failed to fetch citizens. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, isNewYear, toast]);

  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);

  const handleAddCitizen = () => {
    setSelectedCitizen(null);
    setIsModalOpen(true);
  };

  const handleEditCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setIsModalOpen(true);
  };

  const handleCitizenSaved = () => {
    fetchCitizens();
  };

  const handleDeleteYear = async () => {
    if (
      !confirm(
        `Are you sure you want to delete all citizens for year ${selectedYear}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/about/citizens/${selectedYear}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete year");
      }

      toast({
        title: "Year deleted",
        description: `All citizens for year ${selectedYear} have been deleted.`,
      });

      setCitizens([]);

      // Call the callback to update URL
      onYearDeleted?.();
    } catch (error) {
      console.error("Error deleting year:", error);
      toast({
        title: "Error",
        description: "Failed to delete year. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Citizens for {selectedYear}</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleAddCitizen}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Citizen
          </Button>
          {!isNewYear && citizens.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteYear}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Year
            </Button>
          )}
        </div>
      </div>

      {citizens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No citizens found for {selectedYear}
            </p>
            <Button
              onClick={handleAddCitizen}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Citizen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citizens.map((citizen) => (
            <Card key={citizen.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={citizen.image_url || "/placeholder.jpg"}
                  alt={generateAltText(selectedYear, citizen.name)}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{citizen.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCitizen(citizen)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modify
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AboutCitizenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedYear={selectedYear}
        citizen={selectedCitizen}
        onCitizenSaved={handleCitizenSaved}
      />
    </div>
  );
}
