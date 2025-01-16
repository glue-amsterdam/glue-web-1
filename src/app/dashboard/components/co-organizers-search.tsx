import { useState, useEffect } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Participant {
  id: string;
  user_name: string;
  slug: string;
}

interface CoOrganizerSearchProps {
  onSelect: (selectedIds: string[]) => void;
  selectedParticipants: string[];
  maxSelections?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CoOrganizerSearch({
  onSelect,
  selectedParticipants,
  maxSelections = 4,
}: CoOrganizerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [selectedParticipantDetails, setSelectedParticipantDetails] = useState<
    Participant[]
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, error, isLoading } = useSWR(
    debouncedSearchTerm
      ? `/api/users/participants/search?term=${debouncedSearchTerm}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (data) {
      setSearchResults(
        data.filter(
          (participant: Participant) =>
            !selectedParticipants.includes(participant.id)
        )
      );
    }
  }, [data, selectedParticipants]);

  useEffect(() => {
    if (selectedParticipants.length > 0) {
      fetchSelectedParticipants(selectedParticipants);
    } else {
      setSelectedParticipantDetails([]);
    }
  }, [selectedParticipants]);

  const fetchSelectedParticipants = async (ids: string[]) => {
    if (ids.length === 0) {
      setSelectedParticipantDetails([]);
      return;
    }
    const response = await fetch(
      `/api/users/participants/search?ids=${ids.join(",")}`
    );
    if (response.ok) {
      const data = await response.json();
      setSelectedParticipantDetails(data);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (participant: Participant) => {
    if (selectedParticipants.length < maxSelections) {
      const updatedSelected = [...selectedParticipants, participant.id];
      onSelect(updatedSelected);
      setSelectedParticipantDetails((prev) => [...prev, participant]);
      setSearchTerm("");
    }
  };

  const handleRemove = (id: string) => {
    const updatedSelected = selectedParticipants.filter((pId) => pId !== id);
    onSelect(updatedSelected);
    setSelectedParticipantDetails((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Search co-organizers..."
        value={searchTerm}
        onChange={handleSearch}
        disabled={selectedParticipants.length >= maxSelections}
      />
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading participants</p>}
      {searchTerm && searchResults.length > 0 && (
        <ul className="mt-2 border rounded-md shadow-sm">
          {searchResults.map((participant: Participant) => (
            <li
              key={participant.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(participant)}
            >
              {participant.user_name}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedParticipantDetails.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
          >
            <span>{participant.user_name}</span>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => handleRemove(participant.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
