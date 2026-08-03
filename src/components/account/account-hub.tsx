"use client";

import { useEffect, useState } from "react";

import BigButton from "@/components/big-button";
import { AuthPageHeadline } from "@/components/auth/auth-page-headline";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { fetchNavbarIdentity } from "@/lib/users/fetch-navbar-identity";

type HubAction = {
  id: "logout" | "dashboard" | "delete";
  title: string;
  buttonLabel: string;
};

export const AccountHub = () => {
  const { logout, navbarIdentity } = useAuth();
  const [liveDashboardHref, setLiveDashboardHref] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (navbarIdentity) {
      setLiveDashboardHref(null);
      return;
    }

    let cancelled = false;

    const loadIdentity = async () => {
      const identity = await fetchNavbarIdentity();
      if (!cancelled) {
        setLiveDashboardHref(identity?.dashboardHref ?? null);
      }
    };

    void loadIdentity();

    return () => {
      cancelled = true;
    };
  }, [navbarIdentity]);

  const dashboardHref =
    navbarIdentity?.dashboardHref ?? liveDashboardHref ?? null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteError(
          typeof result.message === "string"
            ? result.message
            : "Could not delete your account. Please try again.",
        );
        return;
      }

      setIsDeleteDialogOpen(false);
      await logout();
    } catch {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const actions: HubAction[] = [
    ...(dashboardHref
      ? [
          {
            id: "dashboard" as const,
            title: "Go to your dashboard",
            buttonLabel: "dashboard",
          },
        ]
      : []),
    {
      id: "logout",
      title: "Log out",
      buttonLabel: "log out",
    },
    {
      id: "delete",
      title: "Delete your account",
      buttonLabel: "delete",
    },
  ];

  return (
    <>
      <div className="flex flex-col">
        <AuthPageHeadline title="Account" />
        <div className="title-padding flex flex-col lg:pb-[60px]">
          {actions.map((action, index) => (
            <div key={action.id} className={index === 0 ? "" : "pt-[100px]"}>
              <div className="flex flex-col gap-[40px] lg:gap-[60px] main-boder-top max-w-(--field-max-width) mx-auto">
                <h2 className="small-title-text pt-[15px]">
                  {action.title.toUpperCase()}
                </h2>
                <div className="shrink-0 self-center lg:self-end">
                  {action.id === "dashboard" && dashboardHref ? (
                    <BigButton
                      as="link"
                      href={dashboardHref}
                      label={action.buttonLabel}
                      mode="navbar"
                    />
                  ) : (
                    <BigButton
                      as="button"
                      label={action.buttonLabel}
                      mode="navbar"
                      onClick={
                        action.id === "logout"
                          ? () => void handleLogout()
                          : handleOpenDeleteDialog
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data,
              including your visitor profile and participant details. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p role="alert" className="body-text px-6">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
