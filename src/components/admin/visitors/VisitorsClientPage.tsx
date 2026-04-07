"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
} from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminBackHeader from "@/components/admin/AdminBackHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";

export type VisitorAreaRow = {
  id: string;
  name: string;
  created_at: string | null;
};

const VisitorAreasPanel = () => {
  const { toast } = useToast();
  const [areas, setAreas] = useState<VisitorAreaRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [areaPendingDelete, setAreaPendingDelete] =
    useState<VisitorAreaRow | null>(null);

  const fetchAreas = useCallback(async () => {
    const response = await fetch("/api/admin/visitors/areas");
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        typeof body.error === "string"
          ? body.error
          : "Failed to load work areas"
      );
    }
    const data = await response.json();
    setAreas(data.areas ?? []);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchAreas();
      } catch (e) {
        toast({
          title: "Error",
          description:
            e instanceof Error ? e.message : "Could not load work areas.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [fetchAreas, toast]);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast({
        title: "Name required",
        description: "Enter a label for the new work area (e.g. Student).",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/visitors/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Create failed"
        );
      }
      setNewName("");
      await fetchAreas();
      toast({
        title: "Work area created",
        description: `"${trimmed}" was added.`,
      });
    } catch (e) {
      toast({
        title: "Could not create work area",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (area: VisitorAreaRow) => {
    setEditingId(area.id);
    setEditName(area.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast({
        title: "Name required",
        description: "Work area name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setSavingId(id);
    try {
      const response = await fetch(`/api/admin/visitors/areas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Update failed"
        );
      }
      setEditingId(null);
      setEditName("");
      await fetchAreas();
      toast({
        title: "Work area updated",
        description: `Saved as "${trimmed}".`,
      });
    } catch (e) {
      toast({
        title: "Could not update work area",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleOpenDelete = (area: VisitorAreaRow) => {
    setAreaPendingDelete(area);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!areaPendingDelete) {
      return;
    }
    const id = areaPendingDelete.id;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/visitors/areas/${id}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof body.error === "string" ? body.error : "Delete failed"
        );
      }
      setDeleteOpen(false);
      setAreaPendingDelete(null);
      await fetchAreas();
      toast({
        title: "Work area removed",
        description:
          "Anyone who had this work area selected will no longer have one.",
      });
    } catch (e) {
      toast({
        title: "Could not delete work area",
        description: e instanceof Error ? e.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleCreate();
    }
  };

  const handleEditKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    id: string
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSaveEdit(id);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEdit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
          aria-hidden
        />
        <span className="sr-only">Loading work areas</span>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="visitor-work-areas-heading">
      <div>
        <h2
          id="visitor-work-areas-heading"
          className="text-xl font-semibold text-black"
        >
          Work areas
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Use these to describe who visitors are or what they do — for example{" "}
          <span className="font-medium text-foreground">Student</span> or{" "}
          <span className="font-medium text-foreground">Architect</span>. This is
          not about cities or map locations. Each label must be used only once.
        </p>
      </div>

      <div className="rounded-lg border border-input bg-muted/30 p-4 space-y-3">
        <Label htmlFor="new-area-name">Add work area</Label>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <Input
            id="new-area-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleCreateKeyDown}
            placeholder="e.g. Student, Architect"
            autoComplete="off"
            className="sm:max-w-md"
            aria-describedby="new-area-hint"
          />
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={isCreating || !newName.trim()}
            aria-label="Create new work area"
          >
            {isCreating ? "Creating…" : "Create work area"}
          </Button>
        </div>
        <p id="new-area-hint" className="text-xs text-muted-foreground">
          Press Enter in the field to create quickly.
        </p>
      </div>

      {areas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No work areas yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-input overflow-hidden">
          {areas.map((area) => (
            <li
              key={area.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-background"
            >
              {editingId === area.id ? (
                <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:items-center">
                  <Label htmlFor={`edit-area-${area.id}`} className="sr-only">
                    Edit name for {area.name}
                  </Label>
                  <Input
                    id={`edit-area-${area.id}`}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, area.id)}
                    className="sm:max-w-md"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleSaveEdit(area.id)}
                      disabled={savingId === area.id || !editName.trim()}
                      aria-label="Save work area name"
                    >
                      {savingId === area.id ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      aria-label="Cancel editing work area name"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1 font-medium text-black">
                    {area.name}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(area)}
                      aria-label={`Edit work area ${area.name}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                      <span className="sr-only sm:not-sr-only sm:ml-1">
                        Edit
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenDelete(area)}
                      disabled={deletingId === area.id}
                      aria-label={`Delete work area ${area.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only sm:not-sr-only sm:ml-1">
                        Delete
                      </span>
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this work area?</AlertDialogTitle>
            <AlertDialogDescription>
              {areaPendingDelete ? (
                <>
                  <span className="font-medium text-foreground">
                    {areaPendingDelete.name}
                  </span>{" "}
                  will be removed. Visitors who had chosen it will no longer have a
                  work area.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deletingId !== null}
            >
              {deletingId ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

const VisitorsClientPage = () => {
  return (
    <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="Visitors" />
        <VisitorAreasPanel />
      </div>
    </div>
  );
};

export default VisitorsClientPage;
