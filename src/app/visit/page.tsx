import BottomBlock from '@/components/bottom-block';
import HomeTextSection from '@/components/home/home-text-section/text-section'
import NewsletterHomeSection from '@/components/home/newsletter-section.tsx/newsletter-home-section'
import MainContainer from '@/components/main-container'
import Separator from '@/components/separator';
import TextSectionBlock from '@/components/text-section-block';

type Props = {}

const PAGE_TEXT = {
    intro: {
        title: "Visite the GLUE design route 2026",
        description: "The GLUE Design Route takes place from 17. — 19. September 2026. Discover our program featuring talks, workshops, food and drinks, open studios, and much more. If you’re interested in design, then you’ve come to the right place."
    },
    signUpSection: {
        title: "Sign up to access all information",
        description: "GLUE is free and open to the public. However, you must register to access all the information on our website. And for certain events, you must sign up in advance. "
    },
    discoverSection: {
        title: "Discover this year's routes",
        description: `The first five maps in this guide are neighbourhood routes, explore specific areas of the city.
<br />THE HIGH BROW BIKE RIDE
explore Museum Quarter and Amsterdam South
<br />
THE CENTRE STAGE
explore the centre and its canals
<br />
THE UNDERGROUND DESIGN SCENE RIDE
from Amsterdam South-East towards the centre
<br />
THE NORTH EAST CONNECTION
Amsterdam North and islands tour
<br />
THE HOUTHAVEN HIKE
from the centre towards the Houthavens
<br />

The last four maps are thematic maps with selected highlights across the city:

ALTERNATIVES FROM THE UNEXPECTED
<br />
THE INTERIOR MASTERS CRAWL
<br />
COLLECTIBLE DESIGN COLLAGE

THE CREATIVE CITIZEN OF HONOUR 2025 GRAND TOUR`
    }
}

function Page({ }: Props) {
/*     const sanitizedContent = useSanitizedHTML(PAGE_TEXT.discoverSection.description);
 */    return (
        <main id="visit-page">
            <MainContainer className='cta-padding'>
                <section id="visit-intro-section">
                    <h1 className='title-text'>{PAGE_TEXT.intro.title.toUpperCase()}</h1>
                    <p className='pt-[40px] base-text-size lg:max-w-(--paragraph-max-width)'>{PAGE_TEXT.intro.description}</p>
                </section>
                <Separator />
                <TextSectionBlock
                    button={true}
                    buttonLink="/sign-up"
                    buttonLabel="sign up"
                    description={PAGE_TEXT.signUpSection.description}
                    title={PAGE_TEXT.signUpSection.title}
                    sectionId="visit-sign up-section"
                />
                <Separator />
                <HomeTextSection />
                <Separator />
                <TextSectionBlock
                    button={true}
                    buttonLink="/map"
                    buttonLabel="view map"
                    description={PAGE_TEXT.discoverSection.description}
                    title={PAGE_TEXT.discoverSection.title}
                    sectionId="visit-discover-section"
                />
                <Separator />
                <NewsletterHomeSection />
                <BottomBlock />
            </MainContainer>
        </main>
    )
}

export default Page