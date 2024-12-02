import { Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CitizensYearForm } from "./citizens-year-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { fetchCitizensByYear } from "@/utils/api/admin-api-calls";
import { Citizen } from "@/schemas/citizenSchema";

interface CitizensYearFormWrapperProps {
  selectedYear: string;
}

function CitizensYearData({ selectedYear }: CitizensYearFormWrapperProps) {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchCitizensByYear(selectedYear)
      .then((data) => {
        if (isMounted) {
          setCitizens(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedYear]);

  if (error) {
    throw error;
  }

  if (citizens.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <CitizensYearForm selectedYear={selectedYear} initialCitizens={citizens} />
  );
}

export function CitizensYearFormWrapper({
  selectedYear,
}: CitizensYearFormWrapperProps) {
  return (
    <ErrorBoundary
      fallback={<div>Error loading citizens data. Please try again.</div>}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <CitizensYearData selectedYear={selectedYear} />
      </Suspense>
    </ErrorBoundary>
  );
}
