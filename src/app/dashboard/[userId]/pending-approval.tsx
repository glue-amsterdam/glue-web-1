import React from "react";

type PendingApprovalProps = {
  userName: string;
};

const PendingApproval = ({ userName }: PendingApprovalProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">Pending Approval</h1>
      <p className="mb-2 text-center text-lg">
        Hello {userName}, your account is currently pending approval.
      </p>
      <p className="text-center text-md">
        A moderator will review your application and grant you access to the
        dashboard soon.
      </p>
    </div>
  );
};

export default PendingApproval;
