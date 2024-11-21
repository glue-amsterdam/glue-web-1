import { generateTimestamps, getRandomNumber } from "@/mockConstants";
import { DatabaseAboutContent } from "@/schemas/baseSchema";

export const mockAbout: DatabaseAboutContent = {
  carouselSection: {
    title: "GLUE connected by design",
    description:
      "A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.",
    slides: [
      {
        id: "carousel-image-1",
        imageUrl: `/placeholders/placeholder-1.jpg`,
        alt: "GLUE connected by design 1",
        imageName: "carousel-image-1",
        ...generateTimestamps(),
      },
      {
        id: "carousel-image-2",
        imageUrl: `/placeholders/placeholder-2.jpg`,
        alt: "GLUE connected by design 2",
        imageName: "carousel-image-2",
        ...generateTimestamps(),
      },
      {
        id: "carousel-image-3",
        imageUrl: `/placeholders/placeholder-3.jpg`,
        alt: "GLUE connected by design 3",
        imageName: "carousel-image-3",
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
    citizens: [
      {
        id: "emma-johnson",
        name: "Emma Johnson",
        image: {
          id: "emma-johnson-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          imageName: "emma-johnson-image",
          alt: "Portrait of Emma Johnson, a renowned architect known for her innovative sustainable designs.",
          ...generateTimestamps(),
        },
        description:
          "Emma Johnson is a renowned architect known for her innovative sustainable designs.",
        year: 2023,
      },
      {
        id: "michael-chen",
        name: "Michael Chen",
        image: {
          id: "michael-chen-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          imageName: "michael-chen-image",
          alt: "Portrait of Michael Chen, a fashion designer who incorporates architectural elements into his clothing lines.",
          ...generateTimestamps(),
        },
        description:
          "Michael Chen is a fashion designer who incorporates architectural elements into his clothing lines.",
        year: 2023,
      },
      {
        id: "sophia-patel",
        name: "Sophia Patel",
        image: {
          id: "sophia-patel-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          imageName: "sophia-patel-image",
          alt: "Portrait of Sophia Patel, a structural engineer who bridges the gap between fashion and architecture.",
          ...generateTimestamps(),
        },
        description:
          "Sophia Patel is a structural engineer who bridges the gap between fashion and architecture.",
        year: 2023,
      },
      {
        id: "david-lee",
        name: "David Lee",
        image: {
          id: "david-lee-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of David Lee, an urban planner who integrates fashion concepts into city designs.",
          imageName: "david-lee-image",
          ...generateTimestamps(),
        },
        description:
          "David Lee is an urban planner who integrates fashion concepts into city designs.",
        year: 2024,
      },
      {
        id: "olivia-martinez",
        name: "Olivia Martinez",
        image: {
          id: "olivia-martinez-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Olivia Martinez, a textile innovator creating sustainable fabrics for both fashion and architecture.",
          imageName: "olivia-martinez-image",
          ...generateTimestamps(),
        },
        description:
          "Olivia Martinez is a textile innovator creating sustainable fabrics for both fashion and architecture.",
        year: 2024,
      },
      {
        id: "alexander-kim",
        name: "Alexander Kim",
        image: {
          id: "alexander-kim-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Alexander Kim, a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
          imageName: "alexander-kim-image",
          ...generateTimestamps(),
        },
        description:
          "Alexander Kim is a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
        year: 2024,
      },
      {
        id: "isabella-nguyen",
        name: "Isabella Nguyen",
        image: {
          id: "isabella-nguyen-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Isabella Nguyen, a renowned figure in Amsterdam’s creative community, advocating for cross-disciplinary collaborations.",
          imageName: "isabella-nguyen-image",
          ...generateTimestamps(),
        },
        description: `'𝘈𝘮𝘴𝘵𝘦𝘳𝘥𝘢𝘮 𝘪𝘴 𝘢 𝘧𝘢𝘯𝘵𝘢𝘴𝘵𝘪𝘤 𝘱𝘭𝘢𝘤𝘦 𝘸𝘩𝘦𝘳𝘦 𝘤𝘳𝘦𝘢𝘵𝘪𝘷𝘦𝘴 𝘢𝘮𝘰𝘯𝘨 𝘵𝘩𝘦𝘮𝘴𝘦𝘭𝘷𝘦𝘴 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘰𝘱𝘱𝘰𝘳𝘵𝘶𝘯𝘪𝘵𝘪𝘦𝘴 𝘧𝘰𝘳 𝘵𝘢𝘭𝘦𝘯𝘵𝘴’, says Marcel Wanders founder of @moooi.`,
        year: 2025,
      },
      {
        id: "ethan-carter",
        name: "Ethan Carter",
        image: {
          id: "ethan-carter-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Ethan Carter, a biomimicry specialist applying nature-inspired designs to buildings and clothing.",
          imageName: "ethan-carter-image",
          ...generateTimestamps(),
        },
        description:
          "Ethan Carter is a biomimicry specialist applying nature-inspired designs to both buildings and clothing.",
        year: 2025,
      },
      {
        id: "zoe-anderson",
        name: "Zoe Anderson",
        image: {
          id: "zoe-anderson-image",
          imageUrl: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Zoe Anderson, an acoustics expert designing spaces and garments that interact with sound.",
          imageName: "zoe-anderson-image",
          ...generateTimestamps(),
        },
        description:
          "Zoe Anderson is an acoustics expert designing spaces and garments that interact with sound.",
        year: 2025,
      },
    ],
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
          id: "mission-statement-image",
          imageUrl: `/placeholders/placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
          imageName: "mission-statement-image",
          ...generateTimestamps(),
        },
        description:
          "Our mission is to bridge the gap between architecture and fashion, creating innovative designs that push the boundaries of both fields.",
      },
      {
        id: "meet-the-team",
        title: "Meet the Team",
        image: {
          id: "meet-the-team-image",
          imageUrl: `/placeholders/placeholder-2.jpg`,
          alt: "Innovative architectural fashion design 1",
          imageName: "meet-the-team-image",
          ...generateTimestamps(),
        },
        description:
          "Our diverse team of architects, fashion designers, and engineers work together to create groundbreaking concepts and products.",
      },
      {
        id: "glue-foundation",
        title: "GLUE Foundation",
        image: {
          id: "glue-foundation-image",
          imageUrl: `/placeholders/placeholder-3.jpg`,
          alt: "Innovative architectural fashion design 1",
          imageName: "glue-foundation-image",
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
          id: "glue-tv-image",
          imageUrl: `/placeholders/placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
          imageName: "glue-tv-image",
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
          id: "glue-press-image",
          imageUrl: `/placeholders/placeholder-2.jpg`,
          alt: "Innovative architectural fashion design 1",
          imageName: "glue-press-image",
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
    title: "Sponsors",
    description:
      "Discover the GLUE project, the GLUE Foundation, and the GLUE International initiative.",
  },
  glueInternationalSection: {
    title: "GLUE International",
    subtitle: "GLUE arround the world",
    buttonText: "Visit GLUE International",
    website: "http://glue-international.com",
    buttonColor: { buttonColor: "#10069F" },
  },
  ...generateTimestamps(),
};
