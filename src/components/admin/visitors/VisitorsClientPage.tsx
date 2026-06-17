"use client";

import {
  useCallback,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
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
import {
  addVisitorArea,
  removeVisitorArea,
  saveVisitorArea,
} from "@/app/actions/admin/visitors";

export type VisitorAreaRow = {
  id: string;
  name: string;
  created_at: string | null;
};

type VisitorsClientPageProps = {
  initialAreas: VisitorAreaRow[];
};

const VisitorAreasPanel = ({ initialAreas }: VisitorsClientPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [areaPendingDelete, setAreaPendingDelete] =
    useState<VisitorAreaRow | null>(null);

  const refreshAreas = useCallback(() => {
    router.refresh();
  }, [router]);

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
      await addVisitorArea(trimmed);
      setNewName("");
      refreshAreas();
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
      await saveVisitorArea(id, trimmed);
      setEditingId(null);
      setEditName("");
      refreshAreas();
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
      await removeVisitorArea(id);
      setDeleteOpen(false);
      setAreaPendingDelete(null);
      refreshAreas();
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

      {initialAreas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No work areas yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-input overflow-hidden">
          {initialAreas.map((area) => (
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

const VisitorsClientPage = ({ initialAreas }: VisitorsClientPageProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <VisitorAreasPanel initialAreas={initialAreas} />
    </div>
  );
};

export default VisitorsClientPage;
