import BigButton from '@/components/big-button';
import BottomBlock from '@/components/bottom-block';
import MainContainer from '@/components/main-container'
import Separator from '@/components/separator';

type Props = {}
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
            {
                is_selectable: true,
                id: "small-plan",
                plan_label: "Small",
                plan_price: "€ 600",
                features: [
                    { label: "For individual designers" },
                    { label: "Start-up discount (33%) possible for those within 5 years of graduation (€395) in this case GLUE matches the designer and the location (XSmall)." },
                    { label: "Can be paid in 2 installments" }, {
                        label: "GLUE provides location if needed"
                    }
                ]

            },
            {
                is_selectable: true,
                id: "medium-plan",
                plan_label: "Medium",
                plan_price: "€ 950",
                features: [
                    { label: "For design studios (2–10 fte)" },
                    { label: "Can be paid in installments" },
                    { label: "Opportunity to become a HUB and receive 10% of the participant fees of their HUB members" },
                    { label: "Showrooms presenting one brand only, please select the LARGE package" }
                ]
            },
            {
                is_selectable: true,
                id: "large-plan",
                plan_label: "Large",
                plan_price: "€ 1450",
                features: [
                    { label: "For brands with international showrooms that do not want or cannot become a HUB" }
                ]
            },
            {
                is_selectable: true,
                id: "xlarge-plan",
                plan_label: "XLarge",
                plan_price: "€ 1950",
                features: [
                    { label: "For (design) studios, brands, labels, galleries, shops with office(s) or showroom(s) outsite the Netherlands (10+ fte)" }, {
                        label: "Opportunity to become a HUB and geta 20% commission of the participant fees of their paying HUB participants"
                    }
                ]
            },
            {
                is_selectable: true,
                id: "xxlarge-plan",
                plan_label: "XXLarge",
                plan_price: "€ 4000",
                features: [
                    { label: "For designers, design labels, collective showrooms, galleries, shops, studios" },
                    { label: "EXTRA: VIP event (dedicated Cocktail / lunch/ diner Co hosted by GLUE, start bike tour)" },
                    { label: "interview on our socials" },
                    { label: "GLUE flag" }
                ]
            }
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

const BaseCard = ({ plan }: { plan: any }) => {

    return (
        <article className="main-boder-top lg:h-[480px]">
            <h3 className='pt-[15px] text-[19px] leading-[26px] lg:text-[23px] lg:leading-[29px]'>{plan?.plan_label.toUpperCase()}</h3>
            <p className='text-[19px] leading-[26px]'>{plan?.plan_price.toUpperCase()}</p>
            <ul className='list-none pt-[40px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full lg:h-[310px] overflow-y-auto'>
                {
                    plan?.features.map((feature: { label: string }) => (
                        <li className='base-text-size' key={feature.label}>- {feature.label}</li>
                    ))
                }
            </ul>
            <div className='pt-[40px] flex justify-center'>
                <BigButton
                    as="link"
                    label="select plan"
                    href={`/signup?plan=${plan.id}`}
                    mode="big"
                />
            </div>
        </article>
    )

}

const ApplicationClosed = () => {
    return (
        <div>
            <h1>Application Closed</h1>
        </div>
    )
}


function Page({ }: Props) {
    const applicationClosed = false;
    const plansWithoutBasePlan = page_text.plans_block.plan_list.filter((plan) => plan.id !== "base-card");

    return (
        <main id="participate-page">
            <MainContainer className='pt-[160px] lg:pt-[195px]'>
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
                                    <ApplicationClosed />
                                </>)
                                : (
                                    <>
                                        <IntroCard />
                                        {plansWithoutBasePlan.map((plan) => (
                                            <BaseCard key={plan.id} plan={plan} />
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