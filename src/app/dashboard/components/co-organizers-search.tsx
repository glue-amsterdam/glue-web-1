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
  initialSelected?: string[];
  maxSelections?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CoOrganizerSearch({
  onSelect,
  initialSelected = [],
  maxSelections = 4,
}: CoOrganizerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: participants,
    error,
    isLoading,
  } = useSWR(
    debouncedSearchTerm
      ? `/api/users/participants/search?term=${debouncedSearchTerm}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (initialSelected.length > 0) {
      fetchInitialParticipants(initialSelected);
    }
  }, [initialSelected]);

  const fetchInitialParticipants = async (ids: string[]) => {
    const response = await fetch(
      `/api/users/participants/search?ids=${ids.join(",")}`
    );
    if (response.ok) {
      const data = await response.json();
      setSelectedParticipants(data);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (participant: Participant) => {
    if (selectedParticipants.length < maxSelections) {
      const updatedSelected = [...selectedParticipants, participant];
      setSelectedParticipants(updatedSelected);
      onSelect(updatedSelected.map((p) => p.id));
      setSearchTerm("");
    }
  };

  const handleRemove = (id: string) => {
    const updatedSelected = selectedParticipants.filter((p) => p.id !== id);
    setSelectedParticipants(updatedSelected);
    onSelect(updatedSelected.map((p) => p.id));
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
      {participants && participants.length > 0 && (
        <ul className="mt-2 border rounded-md shadow-sm">
          {participants.map((participant: Participant) => (
            <li
              key={participant.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(participant)}
            >
              {participant.user_name} ({participant.slug})
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
          >
            <span>{participant.user_name}</span>
            <Button
              variant="ghost"
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
