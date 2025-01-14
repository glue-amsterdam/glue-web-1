import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { CiSearch } from "react-icons/ci";
import { Loader2 } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string) => void;
  onSearchComplete?: () => void;
}

export default function SearchForm({
  onSearch,
  onSearchComplete,
}: SearchFormProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSearch = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      onSearch(searchQuery);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (!response.ok) {
          throw new Error("Search request failed");
        }
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      } catch (error) {
        console.error("Error performing search:", error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
        onSearchComplete?.();
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md bg-gray">
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
          onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
          disabled={isLoading}
          aria-label="Search"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="size-4 animate-spin text-primary" />
          </div>
        )}
      </div>
    </form>
  );
}
