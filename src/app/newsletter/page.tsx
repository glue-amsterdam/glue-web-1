"use client";


import CrossButton from '@/components/cross-button';
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
                <section id="newsletter-section">
                    <HeadlineWCross title={pageTexts.title} />
                    <p className="sr-only">{pageTexts.description}</p>
                    <NewsletterForm />
                </section>
            </MainContainer>
        </main>
    );
}

export default Page;
