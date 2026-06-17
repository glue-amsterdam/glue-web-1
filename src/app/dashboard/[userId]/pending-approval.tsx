type ParticipantRequestPendingBannerProps = {
  userName?: string;
};

const ParticipantRequestPendingBanner = ({
  userName,
}: ParticipantRequestPendingBannerProps) => {
  return (
    <div
      className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 mini-padding mb-4"
      role="alert"
    >
      <p className="font-bold">Your participant request is pending</p>
      <p className="text-sm">
        {userName ? `Hello ${userName}, ` : ""}
        We&apos;re reviewing your application. A moderator will approve it
        soon. You can complete your visitor profile below in the meantime.
      </p>
    </div>
  );
};

export default ParticipantRequestPendingBanner;
