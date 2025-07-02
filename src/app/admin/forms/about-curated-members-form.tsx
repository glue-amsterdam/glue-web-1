"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import {
  CuratedMemberSectionHeader,
  curatedMembersSectionSchema,
} from "@/schemas/curatedSchema";
import { mutate } from "swr";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/utils/supabase/storage/client";
import { createClient } from "@/utils/supabase/client";

// --- Types ---
type Participant = {
  user_id: string;
  name: string;
  slug: string;
};

// Utility to delete all images in a folder in Supabase Storage
const deleteAllImagesInFolder = async (bucket: string, folder: string) => {
  const storage = createClient().storage;
  const { data, error } = await storage
    .from(bucket)
    .list(folder, { limit: 100 });
  if (error) return { error };
  if (data && data.length > 0) {
    const paths = data.map(
      (file: { name: string }) => `${folder}/${file.name}`
    );
    const { error: delError } = await storage.from(bucket).remove(paths);
    if (delError) return { error: delError };
  }
  return { error: null };
};

export default function CuratedMembersForm({
  initialData,
}: {
  initialData: CuratedMemberSectionHeader;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<CuratedMemberSectionHeader>({
    resolver: zodResolver(curatedMembersSectionSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<CuratedMemberSectionHeader>(
    "/api/admin/about/curated",
    async () => {
      console.log("Form submitted successfully");
      toast({
        title: "Links updated",
        description: "The curated section have been successfully updated.",
      });
      await mutate("/api/admin/about/curated");
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update curated section. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: CuratedMemberSectionHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string>("");

  const [groupPhotoFile, setGroupPhotoFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [groupParticipants, setGroupParticipants] = useState<{
    [userId: string]: { is_curated: boolean };
  }>({});

  const [groupExists, setGroupExists] = useState<boolean>(false);

  const [isSavingGroup, setIsSavingGroup] = useState<boolean>(false);

  // Fetch participants and group data only when a year is loaded
  // (No initial fetch on mount)
  const handleCreateOrLoadGroup = async () => {
    setIsLoadingGroup(true);
    setGroupPhotoUrl("");
    setGroupPhotoFile(null);
    setGroupParticipants({});
    setGroupExists(false);
    try {
      // Fetch participants for this year
      const resParticipants = await fetch(
        "/api/admin/sticky-groups/participants"
      );
      if (!resParticipants.ok) throw new Error("Failed to fetch participants");
      const participantsData: Participant[] = await resParticipants.json();
      setParticipants(participantsData);
      const res = await fetch(`/api/admin/sticky-groups/${selectedYear}`);
      if (res.ok) {
        const group = await res.json();
        setGroupPhotoUrl(group.group_photo_url || "");
        setGroupParticipants(
          (group.participants || []).reduce(
            (
              acc: { [userId: string]: { is_curated: boolean } },
              p: { participant_user_id: string; is_curated: boolean }
            ) => {
              acc[p.participant_user_id] = { is_curated: p.is_curated };
              return acc;
            },
            {}
          )
        );
        setGroupExists(true);
      } else {
        setGroupPhotoUrl("");
        setGroupParticipants({});
        setGroupExists(false);
      }
    } catch (error) {
      setGroupPhotoUrl("");
      setGroupParticipants({});
      setGroupExists(false);
      toast({
        title: "Error",
        description: "Failed to load group for year.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGroup(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupPhotoFile(file);
      setGroupPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleParticipantToggle = (userId: string) => {
    setGroupParticipants((prev) => {
      const exists = !!prev[userId];
      if (exists) {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      } else {
        return { ...prev, [userId]: { is_curated: true } };
      }
    });
  };

  const handleSaveGroup = async () => {
    setIsSavingGroup(true);
    try {
      let photoUrl = groupPhotoUrl;
      if (groupPhotoFile) {
        toast({
          title: "Updating group photo",
          description: `Deleting previous images for year ${selectedYear}...`,
        });
        const { error: delError } = await deleteAllImagesInFolder(
          "assets",
          `sticky-group/${String(selectedYear)}`
        );
        if (delError) {
          toast({
            title: "Error deleting previous images",
            description:
              delError.message || "Could not delete previous images.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Previous images deleted",
            description: `Uploading new group photo for year ${selectedYear}...`,
          });
        }
        const { imageUrl, error } = await uploadImage({
          maxSizeMB: 1.3,
          file: groupPhotoFile,
          bucket: "assets",
          folder: `sticky-group/${String(selectedYear)}`,
        });
        if (error) throw new Error(error);
        photoUrl = imageUrl;
        setGroupPhotoUrl(imageUrl);
        toast({
          title: "Group photo updated",
          description: `New photo uploaded for year ${selectedYear}.`,
        });
      }
      const payload = {
        year: selectedYear,
        group_photo_url: photoUrl,
        participants: Object.entries(groupParticipants).map(
          ([user_id, { is_curated }]) => ({ user_id, is_curated })
        ),
      };
      let res;
      if (groupExists) {
        // Update existing group
        res = await fetch(`/api/admin/sticky-groups/${selectedYear}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_photo_url: photoUrl,
            participants: payload.participants,
          }),
        });
      } else {
        // Create new group
        res = await fetch("/api/admin/sticky-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error("Failed to save group");
      setGroupExists(true);
      toast({
        title: "Success",
        description: "Sticky group saved!",
      });
      await mutate("/api/admin/sticky-groups/years");
      await handleCreateOrLoadGroup();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to save group.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsSavingGroup(true);
    try {
      toast({
        title: "Deleting group images",
        description: `Deleting all images for year ${selectedYear}...`,
      });
      const { error: delError } = await deleteAllImagesInFolder(
        "assets",
        `sticky-group/${String(selectedYear)}`
      );
      if (delError) {
        toast({
          title: "Error deleting images",
          description:
            delError.message || "Could not delete images for this year.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Images deleted",
          description: `All images for year ${selectedYear} deleted.`,
        });
      }
      const res = await fetch(`/api/admin/sticky-groups/${selectedYear}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete group");
      setGroupPhotoUrl("");
      setGroupPhotoFile(null);
      setGroupParticipants({});
      setGroupExists(false);
      toast({
        title: "Success",
        description: "Sticky group deleted!",
      });
      await mutate("/api/admin/sticky-groups/years");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to delete group.",
        variant: "destructive",
      });
    } finally {
      setIsSavingGroup(false);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  // --- Sticky Groups: Load/Create, Save, Delete ---
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            name="is_visible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Visible</FormLabel>
                  <FormDescription>
                    Toggle to show or hide the CURATED STICKY section
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Section Title"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Section Description"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={["title", "description", "is_visible"]}
          className="w-full"
        />
      </form>
      {/* --- Sticky Groups Management Section (New Model) --- */}
      <div className="mt-10 border-t pt-8">
        <h2 className="text-lg font-semibold mb-4">Sticky Groups (by Year)</h2>
        {/* Year Selector/Input */}
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="sticky-group-year" className="font-medium">
            Year:
          </label>
          <input
            id="sticky-group-year"
            type="number"
            min="2000"
            max="2100"
            value={selectedYear}
            onChange={handleYearChange}
            className="border rounded px-2 py-1 w-28"
            aria-label="Sticky group year"
            disabled={isLoadingGroup || isSavingGroup}
          />
          <button
            type="button"
            onClick={handleCreateOrLoadGroup}
            className="ml-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Load or create group for year"
            disabled={isLoadingGroup || isSavingGroup}
          >
            {isLoadingGroup ? "Loading..." : "Load/Create"}
          </button>
        </div>
        {/* Group Photo Upload */}
        <div className="mb-4">
          <label htmlFor="group-photo" className="font-medium block mb-1">
            Group Photo:
          </label>
          {groupPhotoUrl && (
            <img
              src={groupPhotoUrl}
              alt="Group Photo Preview"
              className="w-32 h-32 object-cover rounded mb-2"
            />
          )}
          <input
            id="group-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            aria-label="Upload group photo"
            className="block"
          />
        </div>
        {/* Participants Assignment */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Assign Participants</h3>
          <div className="max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
            {participants.length === 0 ? (
              <p className="text-gray-500">
                Select or create a group for this year first.
              </p>
            ) : (
              <ul className="space-y-2">
                {participants.map((participant) => (
                  <li
                    key={participant.user_id}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={!!groupParticipants[participant.user_id]}
                      onChange={() =>
                        handleParticipantToggle(participant.user_id)
                      }
                      aria-label={`Toggle participant ${participant.name}`}
                      tabIndex={0}
                    />
                    <span className="flex-1">
                      <a
                        href={`/participants/${participant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 hover:text-blue-800"
                        tabIndex={0}
                        aria-label={`View profile for ${participant.name}`}
                      >
                        {participant.name}
                      </a>
                    </span>
                    {groupParticipants[participant.user_id] && (
                      <span className="text-xs text-green-700 font-semibold">
                        Sticky Curated ✔️
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Group Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveGroup}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            aria-label="Save or update group"
            disabled={isSavingGroup || isLoadingGroup}
          >
            {groupExists ? "Update Group" : "Create Group"}
          </button>
          {groupExists && (
            <button
              type="button"
              onClick={handleDeleteGroup}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              aria-label="Delete group"
              disabled={isSavingGroup || isLoadingGroup}
            >
              Delete Group
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
