import type { AboutPageData } from "@/schemas/aboutPageSchema";

export const ABOUT_PAGE_FIXTURE: AboutPageData = {
  navbar: [
    { label: "Team", href: "#team", is_visible: true },
    { label: "GLUE Foundation", href: "#glue-foundation", is_visible: true },
    { label: "Press & Media", href: "#press-media", is_visible: true },
    { label: "Archive", href: "#archive", is_visible: true },
    { label: "FAQ", href: "#faq", is_visible: true },
    {
      label: "Mission Statement",
      href: "#mission-statement",
      is_visible: true,
    },
  ],
  blocks: [
    {
      id: "meet-the-team",
      title: "Team",
      media: {
        image: { src: "/images/team.jpg", alt: "GLUE Team" },
      },
      description: "Meet the team of the GLUE Cooperation",
      is_visible: true,
      members: [
        {
          name: "Anne Pieterse",
          role: "Project Manager",
          email: "anne@glue.amsterdam",
          phone: "+31 (0)6 2478 5563",
          description:
            "Anne's strategic thinking and organizational prowess turn creative visions into tangible realities.",
        },
        {
          name: "Aldana Alegre",
          role: "Content Manager",
          email: "aldana@glue.amsterdam",
        },
        {
          name: "David Heldt",
          role: "Co-Founder and Creative Director",
          email: "david@glue.amsterdam",
          phone: "+31 (0)6 1551 0727",
          description:
            "David's multifaceted role as a co-founder and creative director paints the larger picture of GLUE's artistic journey.",
        },
      ],
    },
    {
      id: "glue-foundation",
      title: "GLUE Foundation",
      media: {
        image: { src: "/images/glue-foundation.jpg", alt: "GLUE Foundation" },
      },
      description:
        "GLUE Foundation is set up to realise a cultural program for GLUE.",
      is_visible: true,
      text_block_1:
        "GLUE Foundation is set up to realise a cultural program for GLUE. The Foundation is responsible, among other programs, for the yearly nomination and ceremony celebrating the Creative Citizens of Honour in Paradiso, the curated STICKY participants, and GLUE TV.",
      text_block_2:
        "Chair: Sheryl Leysner\nTreasurer: Henk Kwant\nSecretary: Anne Pieterse",
    },
    {
      id: "mission-statement",
      title: "Mission Statement",
      media: {
        image: { src: "/images/glue-2025.jpg", alt: "GLUE Mission" },
      },
      description: "Enriching the Amsterdam design community by",
      is_visible: true,
      text_block_1:
        "bringing together the cultural and commercial sides of our discipline so they can both benefit from each other.",
      text_block_2:
        "showcasing and strengthening the unique DNA of Amsterdam's creative ecosystem, the blend that makes GLUE Amsterdam a truly distinctive design-route.",
    },
    {
      id: "press-media",
      media: {
        image: { src: "/images/glue-2025.jpg", alt: "GLUE Press & Media" },
      },
      title: "Press & Media",
      description: "Press & Media",
      is_visible: true,
      text_block_1:
        "GLUE is committed to supporting and promoting the creative community.",
      text_block_2:
        "GLUE is committed to supporting and promoting the creative community.",
    },
    {
      id: "archive",
      title: "Archiv",
      description: "Archiv",
      is_visible: true,
      years: [2025],
      default_year: 2025,
      default_section: {
        year: 2025,
        media: {
          video: {
            src: "/videos/glue-2025.mp4",
            alt: "GLUE 2025",
            poster: "/images/glue-2025.jpg",
          },
          image: {
            src: "/images/glue-2025.jpg",
            alt: "GLUE 2025",
          },
        },
        numbers: [
          { label: "Spaces", value: "60+" },
          { label: "Exhibitors", value: "150+" },
          { label: "Sticky", value: "20+" },
          { label: "Visitors", value: "2500+" },
        ],
        text_block: {
          title: "Embrace the surprise during glue 2025",
          description:
            "GLUE 2025 was a year of surprises. We had a new location, a new format, and a new team.",
        },
        citizens_of_honour: {},
        sticky_members: {},
      },
    },
    {
      id: "faq",
      title: "FAQ",
      description: "Frequently asked questions about GLUE",
      is_visible: true,
      items: [
        {
          question: "What's the story behind GLUE?",
          answer:
            "<p>GLUE started as a way to connect Amsterdam's design community across cultural and commercial spaces.</p>",
        },
        {
          question: "When does GLUE take place?",
          answer:
            "<p>GLUE runs annually during Amsterdam's design route. Dates are announced on the homepage each year.</p>",
        },
        {
          question: "How can I participate?",
          answer:
            "<p>Visit the Participate page to apply as an exhibitor or join one of our curated programs.</p>",
        },
      ],
    },
  ],
};
