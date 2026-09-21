"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminUserListItem } from "@/types/admin-user";
import {
  filterAdminUsers,
  type AdminUserReportCategory,
  type AdminUserReportCriteria,
} from "@/lib/admin/filter-admin-users";
import {
  downloadUsersReportCsv,
  getDefaultReportFieldsForCategory,
  getReportFieldsForCategory,
  type UsersReportField,
} from "@/lib/admin/download-users-report-csv";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type ParticipantStatusFilter = AdminUserReportCriteria["participantStatus"];
type VisitorAreaFilter = AdminUserReportCriteria["visitorAreaId"];

type VisitorAreaOption = {
  id: string;
  name: string;
};

type UsersReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: AdminUserReportCategory;
  initialParticipantStatus?: ParticipantStatusFilter;
};

const CATEGORIES: { value: AdminUserReportCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "participant", label: "Participants" },
  { value: "visitor", label: "Visitors" },
  { value: "moderator", label: "Moderators" },
];

const selectClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black";

const inputClass =
  "text-sm border border-gray-300 rounded px-2 py-1.5 bg-white text-black";

const toolbarButtonClass =
  "text-xs border border-gray-300 rounded px-2 py-1 text-black disabled:opacity-50";

export const UsersReportDialog = ({
  open,
  onOpenChange,
  initialCategory = "all",
  initialParticipantStatus = "all",
}: UsersReportDialogProps) => {
  const { toast } = useToast();
  const [category, setCategory] =
    useState<AdminUserReportCategory>(initialCategory);
  const [participantStatus, setParticipantStatus] =
    useState<ParticipantStatusFilter>(initialParticipantStatus);
  const [visitorAreaId, setVisitorAreaId] =
    useState<VisitorAreaFilter>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [selectedFields, setSelectedFields] = useState<UsersReportField[]>(
    () => getDefaultReportFieldsForCategory(initialCategory)
  );
  const [visitorAreas, setVisitorAreas] = useState<VisitorAreaOption[]>([]);
  const [areasLoadError, setAreasLoadError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCategory(initialCategory);
    setParticipantStatus(
      initialCategory === "participant" ? initialParticipantStatus : "all"
    );
    setVisitorAreaId("all");
    setCreatedFrom("");
    setCreatedTo("");
    setSelectedFields(getDefaultReportFieldsForCategory(initialCategory));
    setAreasLoadError(null);
    setUsersLoadError(null);
  }, [open, initialCategory, initialParticipantStatus]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setUsersLoadError(null);
      try {
        const response = await fetch("/api/admin/users/report");
        if (!response.ok) {
          throw new Error("Failed to load users");
        }
        const data = (await response.json()) as {
          users?: AdminUserListItem[];
        };
        if (!cancelled) {
          setUsers(data.users ?? []);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setUsersLoadError("Could not load full user list for report");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || category !== "visitor") return;

    let cancelled = false;

    const loadAreas = async () => {
      try {
        const response = await fetch("/api/visitor-areas");
        if (!response.ok) {
          throw new Error("Failed to load areas");
        }
        const data = (await response.json()) as {
          areas?: VisitorAreaOption[];
        };
        if (!cancelled) {
          setVisitorAreas(data.areas ?? []);
          setAreasLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setVisitorAreas([]);
          setAreasLoadError("Could not load visitor areas");
        }
      }
    };

    void loadAreas();

    return () => {
      cancelled = true;
    };
  }, [open, category]);

  const availableFields = useMemo(
    () => getReportFieldsForCategory(category),
    [category]
  );

  const matchedUsers = useMemo(
    () =>
      filterAdminUsers(users, {
        category,
        participantStatus:
          category === "participant" ? participantStatus : "all",
        visitorAreaId: category === "visitor" ? visitorAreaId : "all",
        createdFrom,
        createdTo,
      }),
    [
      users,
      category,
      participantStatus,
      visitorAreaId,
      createdFrom,
      createdTo,
    ]
  );

  const handleToggleField = (field: UsersReportField, checked: boolean) => {
    setSelectedFields((current) => {
      if (checked) {
        if (current.includes(field)) return current;
        return [...current, field];
      }
      return current.filter((item) => item !== field);
    });
  };

  const handleCategoryChange = (value: AdminUserReportCategory) => {
    setCategory(value);
    setParticipantStatus("all");
    setVisitorAreaId("all");
    setSelectedFields(getDefaultReportFieldsForCategory(value));
  };

  const handleDownload = () => {
    const exportFields = selectedFields.filter((field) =>
      availableFields.some((option) => option.key === field)
    );
    if (exportFields.length === 0 || matchedUsers.length === 0) {
      return;
    }

    downloadUsersReportCsv(matchedUsers, exportFields, category);
    toast({
      title: "Report downloaded",
      description: `${matchedUsers.length} user(s) exported.`,
    });
    onOpenChange(false);
  };

  const canDownload =
    !isLoadingUsers &&
    !usersLoadError &&
    selectedFields.some((field) =>
      availableFields.some((option) => option.key === field)
    ) &&
    matchedUsers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto text-black sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Print Report</DialogTitle>
          <DialogDescription>
            Choose who to include and which columns to export as CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Category
            <select
              value={category}
              onChange={(e) =>
                handleCategoryChange(e.target.value as AdminUserReportCategory)
              }
              className={selectClass}
              aria-label="Report category"
            >
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {category === "participant" && (
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Participant status
              <select
                value={participantStatus}
                onChange={(e) =>
                  setParticipantStatus(
                    e.target.value as ParticipantStatusFilter
                  )
                }
                className={selectClass}
                aria-label="Participant status filter"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </label>
          )}

          {category === "visitor" && (
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Area
              <select
                value={visitorAreaId}
                onChange={(e) =>
                  setVisitorAreaId(e.target.value as VisitorAreaFilter)
                }
                className={selectClass}
                aria-label="Visitor area filter"
              >
                <option value="all">All areas</option>
                <option value="none">No area</option>
                {visitorAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
              {areasLoadError && (
                <span className="text-xs text-red-600">{areasLoadError}</span>
              )}
            </label>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Created from
              <input
                type="date"
                value={createdFrom}
                onChange={(e) => setCreatedFrom(e.target.value)}
                className={inputClass}
                aria-label="Created from date"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Created to
              <input
                type="date"
                value={createdTo}
                onChange={(e) => setCreatedTo(e.target.value)}
                className={inputClass}
                aria-label="Created to date"
              />
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs text-gray-600">Columns</legend>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {availableFields.map(({ key, label }) => {
                const checkboxId = `users-report-field-${key}`;
                const checked = selectedFields.includes(key);
                return (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        handleToggleField(key, e.target.checked)
                      }
                      className="h-4 w-4"
                      aria-label={label}
                    />
                    <label
                      htmlFor={checkboxId}
                      className="cursor-pointer text-sm text-black"
                    >
                      {label}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {isLoadingUsers
              ? "Loading full user list…"
              : usersLoadError
                ? usersLoadError
                : `${matchedUsers.length} user${
                    matchedUsers.length === 1 ? "" : "s"
                  } match`}
          </p>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={toolbarButtonClass}
            aria-label="Cancel report"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!canDownload}
            className="text-xs border border-black rounded px-2 py-1 bg-black text-white disabled:opacity-50"
            aria-label="Download CSV report"
          >
            Download CSV
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
