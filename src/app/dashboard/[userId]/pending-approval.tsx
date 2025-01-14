import React from "react";

interface PendingApprovalProps {
  userName: string;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ userName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Pending Approval</h1>
      <p className="text-lg text-center mb-2">
        Hello {userName}, your account is currently pending approval.
      </p>
      <p className="text-md text-center">
        A moderator will review your application and grant you access to the
        dashboard soon.
      </p>
    </div>
  );
};

export default PendingApproval;
