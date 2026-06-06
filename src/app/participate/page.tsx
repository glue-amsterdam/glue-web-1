import BigButton from '@/components/big-button';
import BottomBlock from '@/components/bottom-block';
import MainContainer from '@/components/main-container'
import Separator from '@/components/separator';
import { getParticipatePlans } from '@/lib/participate/get-participate-plans';
import type { ParticipatePlanCard } from '@/lib/participate/types';

const page_text = {
    intro: {
        title: "Become part of the GLUE design route 2026",
        description: "GLUE gives you the opportunity to showcase your work to an international design-focused audience. You will be featured on the GLUE platform. This will give you direct visibility and allow you to invite visitors to join you on your creative journey. You will also have the chance to connect with other creatives, reach potential clients, and expand your network.",
    },
    numbers: {
        title: "Last year numbers",
        items: [
            {
                label: "Spaces",
                value: "60+"
            },
            {
                label: "Exhibitors",
                value: "150+"
            },
            {
                label: "Sticky",
                value: "20+"
            },
            {
                label: "Visitors",
                value: "2500+"
            }
        ]
    },
    explication: {
        title: "How it works",
        steps: [
            {

                title: "1. Select a plan",
                description: "Select a fitting plan."
            },
            {

                title: "2. Sign up",
                description: "Create an account to begin your application."
            },
            {
                title: "3. Get Access",
                description: "Once your application has been approved, you will gain access to your personal dashboard."
            },
            {
                title: "4. Complete Portfolio",
                description: "Enter your details, images and other information to appear on the GLUE website."
            }
        ]
    },
    plans_block: {
        title: "Select a plan",
        deadline: "Application deadline 1 June 2026.",
        description: "Combi discount if you participate both at GLUE Utrecht (www.glue-utrecht.nl) and GLUE Amsterdam you get a 10% discount over the total fee of both GLUE participant fees. Optional at extra charge are a GLUE beach flag, printed maps, organising a bike-tour (please send us an email if your interested and we make you an offer). In general part of all the packages are:",
        plan_list: [
            {
                is_selectable: false,
                id: "base-card",
                plan_label: `GLUE Packages`,
                plan_price: "(you get with every package)",
                features: [
                    { label: "Year through connection opportunities in the design community" },
                    { label: "Dot on the GLUE Map and along GLUE route" },
                    { label: "Landing page and visibility on the GLUE Website" },
                    { label: "Publicity; for example item in newsletter, insta post" },
                ]
            },
        ]
    }
}

const IntroCard = () => {
    const basePlan = page_text.plans_block.plan_list.find((plan) => plan.id === "base-card");
    return (
        <article className="base-text-size lg:border-t-2 lg:border-(--black-color)">
            <h3 className='lg:pt-[15px]'>{basePlan?.plan_label.toUpperCase()}</h3>
            <p>{basePlan?.plan_price.toUpperCase()}</p>
            <ul className='list-none pt-[15px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full'>
                {
                    basePlan?.features.map((feature) => (
                        <li key={feature.label}>- {feature.label}</li>
                    ))
                }
            </ul>
        </article>
    )

}

const BaseCard = ({ plan, intent }: { plan: ParticipatePlanCard; intent?: string }) => {
    const intentQuery =
        intent === "reactivation" ? "&intent=reactivation" : "";

    return (
        <article className="main-boder-top lg:h-[480px]">
            <h3 className='pt-[15px] text-[19px] leading-[26px] lg:text-[23px] lg:leading-[29px]'>{plan?.plan_label.toUpperCase()}</h3>
            <p className='text-[19px] leading-[26px]'>{plan?.plan_price.toUpperCase()}</p>
            <ul className='list-none pt-[40px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full lg:h-[310px] overflow-y-auto'>
                {
                    plan?.features.map((feature) => (
                        <li className='base-text-size' key={feature.label}>- {feature.label}</li>
                    ))
                }
            </ul>
            <div className='pt-[40px] flex justify-center'>
                <BigButton
                    as="link"
                    label="select plan"
                    href={`/participate/apply?planId=${plan.id}${intentQuery}`}
                    mode="big"
                />
            </div>
        </article>
    )

}

const ApplicationClosed = ({ message }: { message: string }) => {
    return (
        <div className="base-text-size col-span-full">
            <p>{message || "Applications are currently closed."}</p>
        </div>
    )
}


async function Page({
    searchParams,
}: {
    searchParams: Promise<{ intent?: string }>;
}) {
    const { intent } = await searchParams;
    const { applicationClosed, closedMessage, selectablePlans } =
        await getParticipatePlans();

    return (
        <main id="participate-page">
            <MainContainer className='cta-padding'>
                <section id='participate-intro-section'>
                    <h1 className='title-text'>{page_text.intro.title}</h1>
                    <p className='pt-[40px] base-text-size lg:max-w-(--paragraph-max-width)'>{page_text.intro.description}</p>
                </section>
                <Separator />
                <section id='participate-numbers-section'>
                    <h2 className='title-text pt-[15px]'>{page_text.numbers.title.toUpperCase()}</h2>
                    <ul className='pt-[40px] lg:pt-[60px] grid grid-cols-2 lg:flex lg:items-center lg:justify-center lg:w-full gap-[20px] lg:gap-[30px] justify-items-center'>
                        {
                            page_text.numbers.items.map((item) => (
                                <li className='flex flex-col items-center lg:min-w-[230px]' key={item.label}>
                                    <span className="title-text">{item.value}</span> <p className="base-text-size">{item.label}</p>
                                </li>
                            ))
                        }
                    </ul>
                </section>
                <Separator />
                <section id='participate-explication-section'>
                    <h2 className='title-text pt-[15px]'>{page_text.explication.title.toUpperCase()}</h2>
                    <ul className='pt-[40px] list-none flex-col flex gap-[40px] base-text-size'>
                        {
                            page_text.explication.steps.map((step) => (
                                <li key={step.title}>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </li>
                            ))
                        }
                    </ul>
                    <div className='pt-[40px] flex justify-center'>
                        <BigButton
                            as="link"
                            label="start now"
                            href="#plans-selection-section"
                            mode="big"
                        /></div>
                </section>
                <Separator />
                <section id='plans-selection-section'>
                    <h2 className='title-text pt-[15px]'>{page_text.plans_block.title.toUpperCase()}</h2>
                    <h3 className='base-text-size pt-[40px] lg:pt-[60px]'>{page_text.plans_block.deadline}</h3>
                    <p className='base-text-size pt-[20px] lg:pt-[30px] lg:max-w-(--paragraph-max-width)'>{page_text.plans_block.description}</p>
                    <ul className='pt-[40px] lg:pt-[60px] grid grid-cols-1 lg:grid-cols-3 gap-[40px] lg:gap-x-[30px] lg:gap-y-[100px]'>
                        {
                            applicationClosed ?
                                (<>
                                    <IntroCard />
                                    <ApplicationClosed message={closedMessage} />
                                </>)
                                : (
                                    <>
                                        <IntroCard />
                                        {selectablePlans.map((plan) => (
                                            <BaseCard key={plan.id} plan={plan} intent={intent} />
                                        ))}
                                    </>
                                )}
                    </ul>
                </section>
                <BottomBlock />
            </MainContainer>

        </main>
    )
}

export default Page
