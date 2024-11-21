import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";

interface SearchFormProps {
  onSearch: (query: string) => void;
  onSearchComplete?: () => void;
}

export default function SearchForm({
  onSearch,
  onSearchComplete,
}: SearchFormProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchQuery);
    onSearchComplete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchQuery);
      onSearchComplete?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray">
      <div className="relative">
        <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-8 text-uiblack"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />
      </div>
    </form>
  );
}
