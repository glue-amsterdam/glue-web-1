import BottomBlock from '@/components/bottom-block';
import CmsIntroSection from '@/components/cms/cms-intro-section';
import CmsTextSection from '@/components/cms/cms-text-section';
import StaggerEnterContainer from "@/components/stagger-enter-container";
import ParticipatePlanCardView from '@/components/participate/participate-plan-card';
import Separator from '@/components/separator';
import YearNumbersSection from '@/components/yearly-sections/year-numbers-section';
import { participateMetadata } from '@/lib/metadata';
import { parseEmailParam } from '@/lib/auth/post-auth-redirect';
import { getParticipationEligibility } from '@/lib/participate/get-participation-eligibility';
import { getCachedParticipatePageData } from '@/lib/participate/get-participate-plans';
import { getCachedLatestYearNumbers } from '@/lib/year-numbers/cached-year-numbers';
import { formatYearNumbersTitle } from '@/lib/year-numbers/format-year-numbers-title';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = participateMetadata;

/** Must match TEXT_SECTION_REVALIDATE_SECONDS (segment config requires a literal). */
export const revalidate = 5_184_000;

const ApplicationClosed = ({ message }: { message: string }) => {
    return (
        <div className="base-text-size col-span-full">
            <p>{message || "Applications are currently closed."}</p>
        </div>
    )
}

const ParticipationBlockedNotice = ({
    message,
    dashboardHref,
}: {
    message: string;
    dashboardHref: string | null;
}) => {
    return (
        <div
            className="col-span-full rounded-md border border-(--black-color)/15 bg-(--white-color) px-4 py-5"
            role="status"
        >
            <p className="body-text">{message}</p>
            {dashboardHref ? (
                <p className="pt-[20px]">
                    <Link
                        href={dashboardHref}
                        className="body-text underline hover:no-underline"
                    >
                        Go to your dashboard
                    </Link>
                </p>
            ) : null}
        </div>
    );
};

async function Page({
    searchParams,
}: {
    searchParams: Promise<{ intent?: string; email?: string }>;
}) {
    const params = await searchParams;
    const { intent } = params;
    const emailSearchParams = new URLSearchParams();
    if (params.email) {
        emailSearchParams.set("email", params.email);
    }
    const prefilledEmail = parseEmailParam(emailSearchParams);
    const [
        { applicationClosed, closedMessage, basePackage, selectablePlans },
        latestYearNumbers,
        eligibility,
    ] = await Promise.all([
        getCachedParticipatePageData(),
        getCachedLatestYearNumbers(),
        getParticipationEligibility(intent),
    ]);

    return (
        <main id="participate-page">
            <StaggerEnterContainer variant="enter" className="cta-padding">
                <CmsIntroSection slug="participate-intro" />
                <Separator />
                {latestYearNumbers.items.length > 0 ? (
                    <>
                        <YearNumbersSection
                            title={formatYearNumbersTitle(latestYearNumbers.year)}
                            items={latestYearNumbers.items}
                            sectionId="participate-numbers-section"
                        />
                        <Separator />
                    </>
                ) : null}
                <CmsTextSection slug="participate-how-it-works" shouldGrid />
                <Separator />
                <CmsTextSection slug="participate-select-plan" />
                {!eligibility.canSelectPlan && eligibility.blockReason ? (
                    <div className="pt-[40px]">
                        <ParticipationBlockedNotice
                            message={eligibility.blockReason}
                            dashboardHref={eligibility.dashboardHref}
                        />
                    </div>
                ) : null}
                <ul className="pt-[40px] lg:pt-[60px] grid grid-cols-1 lg:grid-cols-3 lg:items-stretch gap-[40px] lg:gap-x-[30px] lg:gap-y-[100px]">
                    {
                        applicationClosed ?
                            (<>
                                <ParticipatePlanCardView plan={basePackage} variant="base" />
                                <ApplicationClosed message={closedMessage} />
                            </>)
                            : (
                                <>
                                    <ParticipatePlanCardView plan={basePackage} variant="base" />
                                    {selectablePlans.map((plan) => (
                                        <ParticipatePlanCardView
                                            key={plan.id}
                                            plan={plan}
                                            applyIntent={eligibility.resolvedIntent}
                                            variant="selectable"
                                            planSelectionDisabled={!eligibility.canSelectPlan}
                                            disabledReason={eligibility.blockReason}
                                            email={prefilledEmail}
                                        />
                                    ))}
                                </>
                            )}
                </ul>
                <BottomBlock />
            </StaggerEnterContainer>

        </main>
    )
}

export default Page
