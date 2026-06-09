import CmsIntroSection from "@/components/cms/cms-intro-section";
import BigButton from "@/components/big-button";

type DashboardParticipateInviteProps = {
  ctaHref: string;
  ctaLabel: string;
};

export const DashboardParticipateInvite = ({
  ctaHref,
  ctaLabel,
}: DashboardParticipateInviteProps) => {
  return (
    <section
      className="mb-8 rounded-md border border-(--black-color)/15 bg-(--white-color) px-4 py-6 lg:px-6"
      aria-labelledby="dashboard-participate-invite-title"
    >
      <CmsIntroSection slug="participate-intro" />
      <div className="pt-[30px]">
        <BigButton as="link" href={ctaHref} label={ctaLabel} mode="big" />
      </div>
    </section>
  );
};
