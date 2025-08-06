"use client";

import LoadingSpinner from "@/app/components/LoadingSpinner";
import CreateHubClientPage from "@/app/dashboard/[userId]/hub-create/create-hub-client-page";
import { UserInfo } from "@/schemas/userInfoSchemas";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreateHub() {
  const {
    data: userInfoList,
    error,
    isLoading,
  } = useSWR<UserInfo[]>("/api/users/participants/hub", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load user data</div>;

  return (
    <>
      <CreateHubClientPage userInfoList={userInfoList} />
    </>
  );
}

export default CreateHub;
