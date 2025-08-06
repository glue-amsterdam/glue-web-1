"use client";

import { useState } from "react";
import useSWR from "swr";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HubApiCall } from "@/schemas/hubSchemas";
import { UserInfo } from "@/schemas/userInfoSchemas";
import { useToast } from "@/hooks/use-toast";
import { EditHubForm } from "@/app/dashboard/[userId]/hub-edit/hub-edit-form";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HubsList() {
  const {
    data: hubs,
    error,
    isLoading,
    mutate,
  } = useSWR<HubApiCall[]>("/api/hubs", fetcher);
  const { data: userInfoList } = useSWR<UserInfo[]>(
    "/api/users/participants/hub",
    fetcher
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState<HubApiCall | null>(null);
  const [hubToDelete, setHubToDelete] = useState<HubApiCall | null>(null);
  const { toast } = useToast();

  const filteredHubs = hubs?.filter((hub) =>
    hub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditHub = (hub: HubApiCall) => {
    setSelectedHub(hub);
  };

  const handleDeleteHub = (hub: HubApiCall) => {
    setHubToDelete(hub);
  };

  const confirmDeleteHub = async () => {
    if (!hubToDelete) return;

    try {
      const response = await fetch(`/api/hubs?id=${hubToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete hub");
      }

      toast({
        title: "Success",
        description: "Hub deleted successfully.",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting hub:", error);
      toast({
        title: "Error",
        description: "Failed to delete hub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setHubToDelete(null);
    }
  };

  const handleSubmit = async (values: HubApiCall) => {
    try {
      const response = await fetch(`/api/hubs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update hub");
      }

      toast({
        title: "Success",
        description: "Hub updated successfully.",
      });
      mutate();
      setSelectedHub(null);
    } catch (error) {
      console.error("Error updating hub:", error);
      toast({
        title: "Error",
        description: "Failed to update hub. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load hubs</div>;

  return (
    <div className="w-full max-w-[90%] mx-auto flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Hubs</h1>
      <div className="flex justify-between items-center ">
        <Input
          type="text"
          placeholder="Search hubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white text-black"
        />
      </div>
      <Table className="bg-white rounded-xl text-black">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredHubs?.map((hub) => (
            <TableRow key={hub.id}>
              <TableCell>{hub.name}</TableCell>
              <TableCell>
                {hub.hub_host.user_name ||
                  hub.hub_host.visible_emails?.[0] ||
                  hub.hub_host.user_id}
              </TableCell>
              <TableCell>{hub.participants.length}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditHub(hub)}>Edit</Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteHub(hub)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedHub}
        onOpenChange={(open) => !open && setSelectedHub(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-black">
          <DialogHeader>
            <DialogTitle>Edit Hub</DialogTitle>
          </DialogHeader>
          {selectedHub && (
            <EditHubForm
              hub={selectedHub}
              userInfoList={userInfoList || []}
              onSubmit={handleSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!hubToDelete}
        onOpenChange={(open) => !open && setHubToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this hub?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hub
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteHub}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
