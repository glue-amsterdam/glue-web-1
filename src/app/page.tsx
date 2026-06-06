import { config } from "@/config";
import type { Metadata } from "next";

import { loadHomePageData } from "@/lib/home/load-home-page-data";

import MainContainer from "@/components/main-container";
import Hero from "@/components/home/hero-section/hero";
import ExhibitorsHome from "@/components/home/exhibitors-section/exhibitors-home";
import CreativeCitizensOfHonour from "@/components/home/citizens-of-honour-section/creative-citizens-of-honour";
import BecomeAnExhibitor from "@/components/home/become-an-exhibitor-section/become-an-exhibitor";
import HomeTextSection from "@/components/home/home-text-section/text-section";
import StickyParticipantsSection from "@/components/home/sticky-participants-section/sticky-participants-section";
import NewsletterHomeSection from "@/components/home/newsletter-section.tsx/newsletter-home-section";
import BottomBlock from "@/components/bottom-block";
import Separator from "@/components/separator";




export const revalidate = 3600;



const homeStructuredData = {

  "@context": "https://schema.org",

  "@graph": [

    {

      "@type": "WebSite",

      name: `GLUE ${config.cityName}`,

      url: config.baseUrl,

      description: `GLUE ${config.cityName} design route — connected by design.`,

    },

    {

      "@type": "Organization",

      name: `GLUE ${config.cityName}`,

      url: config.baseUrl,

      sameAs: [

        "https://www.linkedin.com/company/glue-amsterdam-connected-by-design/",

        "https://www.instagram.com/glue.amsterdam",

        "https://www.youtube.com/@GLUETV_amsterdam",

      ],

    },

  ],

};



export const metadata: Metadata = {

  alternates: {

    canonical: config.baseUrl,

  },

  other: {

    "application/ld+json": JSON.stringify(homeStructuredData),

  },

};



export default async function Page() {

  const { stickyGroupData, citizensData, homeVideoData } = await loadHomePageData();



  return (

    <main id="main-content" className="first-padding">

      <MainContainer>

        <Hero

          videoUrl={homeVideoData.videoUrl}

          posterUrl={homeVideoData.posterUrl}

        />

        <ExhibitorsHome />
        <Separator />
        <BecomeAnExhibitor />

        <CreativeCitizensOfHonour data={citizensData} />
        <Separator />
        <HomeTextSection />

        <StickyParticipantsSection data={stickyGroupData} />
        <Separator />
        <NewsletterHomeSection />

        <BottomBlock />

      </MainContainer>

    </main>

  );

}

