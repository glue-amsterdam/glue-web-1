type ParticipationPrefilledHintProps = {
  show: boolean;
};

export const ParticipationPrefilledHint = ({
  show,
}: ParticipationPrefilledHintProps) => {
  if (!show) return null;

  return (
    <p
      className="base-text-size pb-[20px] text-(--black-color)/80 border border-(--black-color)/20 rounded-md px-4 py-3"
      role="note"
    >
      We&apos;ve pre-filled this with your current profile data. Update anything
      that has changed.
    </p>
  );
};
