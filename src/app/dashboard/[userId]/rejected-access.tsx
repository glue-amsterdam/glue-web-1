import React from "react";

interface RejectedAccessProps {
  userName: string;
}

const RejectedAccess: React.FC<RejectedAccessProps> = ({ userName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Access Rejected</h1>
      <p className="text-lg text-center mb-2">
        {`We're sorry, ${userName}, but your access to the dashboard has been rejected.`}
      </p>
      <p className="text-md text-center">
        If you believe this is an error, please contact our support team for
        assistance.
      </p>
    </div>
  );
};

export default RejectedAccess;
