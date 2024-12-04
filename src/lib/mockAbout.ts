import { generateTimestamps, getRandomNumber } from "@/mockConstants";
import { DatabaseAboutContent } from "@/schemas/baseSchema";

export const mockAbout: DatabaseAboutContent = {
  carouselSection: {
    title: "GLUE connected by design",
    description:
      "A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.",
    slides: [
      {
        image_url: `/placeholders/placeholder-1.jpg`,
        alt: "GLUE connected by design 1",
        image_name: "carousel-image-1",
        ...generateTimestamps(),
      },
      {
        image_url: `/placeholders/placeholder-2.jpg`,
        alt: "GLUE connected by design 2",
        image_name: "carousel-image-2",
        ...generateTimestamps(),
      },
      {
        image_url: `/placeholders/placeholder-3.jpg`,
        alt: "GLUE connected by design 3",
        image_name: "carousel-image-3",
        ...generateTimestamps(),
      },
    ],
  },
  participantsSection: {
    title: "Participants",
    description:
      "Discover all participating brands, designers, studio's and academies of GLUE amsterdam connected by design",
  },
  citizensSection: {
    title: "Creative Citizens of Honour",
    description:
      "Three creative industry leaders have been chosen each year for their outstanding contribution to the city's social cohesion. Discover who they are!",
    citizensByYear: {
      "2023": [
        {
          id: "emma-johnson",
          name: "Emma Johnson",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          image_name: "emma-johnson-image",
          alt: "Portrait of Emma Johnson, a renowned architect known for her innovative sustainable designs.",
          description:
            "Emma Johnson is a renowned architect known for her innovative sustainable designs.",
          section_id: "",
          year: "2023",
        },
        {
          id: "michael-chen",
          name: "Michael Chen",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          image_name: "michael-chen-image",
          description:
            "Michael Chen is a fashion designer who incorporates architectural elements into his clothing lines.",
          alt: "",
          section_id: "",
          year: "2023",
        },
        {
          id: "sophia-patel",
          name: "Sophia Patel",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          image_name: "sophia-patel-image",
          description:
            "Sophia Patel is a structural engineer who bridges the gap between fashion and architecture.",
          alt: "Portrait of Sophia Patel, a structural engineer who bridges the gap between fashion and architecture.",
          section_id: "",
          year: "2023",
        },
      ],
      "2024": [
        {
          id: "david-lee",
          name: "David Lee",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of David Lee, an urban planner who integrates fashion concepts into city designs.",
          description:
            "David Lee is an urban planner who integrates fashion concepts into city designs.",
          section_id: "",
          year: "2024",
        },
        {
          id: "olivia-martinez",
          name: "Olivia Martinez",

          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Olivia Martinez, a textile innovator creating sustainable fabrics for both fashion and architecture.",

          description:
            "Olivia Martinez is a textile innovator creating sustainable fabrics for both fashion and architecture.",
          section_id: "",
          year: "2024",
        },
        {
          id: "alexander-kim",
          name: "Alexander Kim",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Alexander Kim, a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
          description:
            "Alexander Kim is a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
          section_id: "",
          year: "2024",
        },
      ],
      "2025": [
        {
          id: "isabella-nguyen",
          name: "Isabella Nguyen",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Isabella Nguyen, a renowned figure in Amsterdam’s creative community, advocating for cross-disciplinary collaborations.",
          description: `'𝘈𝘮𝘴𝘵𝘦𝘳𝘥𝘢𝘮 𝘪𝘴 𝘢 𝘧𝘢𝘯𝘵𝘢𝘴𝘵𝘪𝘤 𝘱𝘭𝘢𝘤𝘦 𝘸𝘩𝘦𝘳𝘦 𝘤𝘳𝘦𝘢𝘵𝘪𝘷𝘦𝘴 𝘢𝘮𝘰𝘯𝘨 𝘵𝘩𝘦𝘮𝘴𝘦𝘭𝘷𝘦𝘴 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘰𝘱𝘱𝘰𝘳𝘵𝘶𝘯𝘪𝘵𝘪𝘦𝘴 𝘧𝘰𝘳 𝘵𝘢𝘭𝘦𝘯𝘵𝘴’, says Marcel Wanders founder of @moooi.`,
          section_id: "",
          year: "2025",
        },
        {
          id: "ethan-carter",
          name: "Ethan Carter",

          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Ethan Carter, a biomimicry specialist applying nature-inspired designs to buildings and clothing.",

          description:
            "Ethan Carter is a biomimicry specialist applying nature-inspired designs to both buildings and clothing.",
          section_id: "",
          year: "2025",
        },
        {
          id: "zoe-anderson",
          name: "Zoe Anderson",
          image_url: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Zoe Anderson, an acoustics expert designing spaces and garments that interact with sound.",
          description:
            "Zoe Anderson is an acoustics expert designing spaces and garments that interact with sound.",
          section_id: "",
          year: "2025",
        },
      ],
    },
  },
  curatedMembersSection: {
    title: "GLUE STICKY MEMBER",
    description:
      "Discover the GLUE STICKY MEMBER, a curated group of designers, architects, and creatives who have made a significant impact on the industry.",
  },
  infoItemsSection: {
    title: "Information",
    description:
      "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
    infoItems: [
      {
        id: "mission-statement",
        title: "Mission Statement",
        image: {
          image_url: `/placeholders/placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
          image_name: "mission-statement-image",
          ...generateTimestamps(),
        },
        description:
          "Our mission is to bridge the gap between architecture and fashion, creating innovative designs that push the boundaries of both fields.",
      },
      {
        id: "meet-the-team",
        title: "Meet the Team",
        image: {
          image_url: `/placeholders/placeholder-2.jpg`,
          alt: "Innovative architectural fashion design 1",
          image_name: "meet-the-team-image",
          ...generateTimestamps(),
        },
        description:
          "Our diverse team of architects, fashion designers, and engineers work together to create groundbreaking concepts and products.",
      },
      {
        id: "glue-foundation",
        title: "GLUE Foundation",
        image: {
          image_url: `/placeholders/placeholder-3.jpg`,
          alt: "Innovative architectural fashion design 1",
          image_name: "glue-foundation-image",
          ...generateTimestamps(),
        },
        description:
          "The GLUE Foundation supports emerging talents in the fields of architecture and fashion, fostering collaboration and innovation.",
      },
    ],
  },
  pressItemsSection: {
    title: "Press",
    description:
      "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
    pressItems: [
      {
        id: "glue-tv",
        title: "GLUE TV",
        image: {
          image_url: `/placeholders/placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
          image_name: "glue-tv-image",
          ...generateTimestamps(),
        },
        description: `The third edition of GLUE TV was recorded in the studio of Pakhuis de Zwijger, the platform for social innovation & creation in Amsterdam. GLUE TV focussed this year on members that were invited to explore the definition of design, and stretch its limits a bit; the so called STICKY members. But we used the platform also to interview GLUE’s Creative Citizens of Honour: Wouter Valkenier, Marian Duff and Janine Toussaint. Due to the storm Poly some interviews took place online.
    
    As part of the ‘Stretching the Definition of Design’ theme, Rubiah Balsem, Jeroen Junte, Gabrielle Kennedy, and Marsha Simon interviewed, amongst them: Georgie Frankel, Yamuna Forzani, Shahar Livne, Chen Yu Wang and Rink Schelling. Bas de Groot was in charge of editing. In the run-up to the design route in September, you can watch them via SALTO TV.
    
    Get inspired and check out all interviews on Youtube or SALTO TV.`,
      },
      {
        id: "glue-press",
        title: "Press",
        image: {
          image_url: `/placeholders/placeholder-2.jpg`,
          alt: "Innovative architectural fashion design 1",
          image_name: "glue-press-image",
          ...generateTimestamps(),
        },
        description: `Please contact Karin Dijksman for the most recent press release,
          high-res images and other press enquires.
          
          Dijksman Communicatie
          
          Westerstraat 187 (2nd floor), Amsterdam
          
          Karin Dijksman
          
          karin@dijksmancommunicatie.nl
          
          06 3100 6880`,
      },
    ],
  },
  sponsorsSection: {
    sponsorsSection: {
      title: "Sponsors",
      description:
        "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
      sponsorsTypes: [
        { label: "Gold" },
        { label: "Silver" },
        { label: "Bronze" },
      ],
    },
  },
  glueInternationalSection: {
    title: "GLUE International",
    subtitle: "GLUE arround the world",
    button_text: "Visit GLUE International",
    website: "http://glue-international.com",
    button_color: "#10069F",
  },
  ...generateTimestamps(),
};
