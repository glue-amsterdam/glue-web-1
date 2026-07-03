"use client";


import StaggerEnterContainer from "@/components/stagger-enter-container";
import HeadlineWCross from '@/components/headline-w-cross';
import MainContainer from '@/components/main-container';
import NewsletterForm from '@/components/newsletter/newsletter-form';



const pageTexts = {
    title: "Newsletter",
    description: "Subscribe to our newsletter to get the latest news and updates about the GLUE design route.",
};

function Page() {
    return (
        <main id="newsletter-page" className="first-padding pb-[65px] md:pb-[105px]">
            <MainContainer>
                <StaggerEnterContainer as="section" variant="enter" id="newsletter-section">
                    <HeadlineWCross title={pageTexts.title} />
                    <p className="sr-only">{pageTexts.description}</p>
                    <NewsletterForm />
                </StaggerEnterContainer>
            </MainContainer>
        </main>
    );
}

export default Page;
