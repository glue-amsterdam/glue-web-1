import { members } from "@/lib/mockMembers";
import { DatabaseContent } from "@/utils/about-types";

const getRandomNumber = () => Math.floor(Math.random() * 4) + 1;

export const mockAbout: DatabaseContent = {
  carouselSection: {
    title: "GLUE connected by design",
    description:
      "A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.",
    slides: [
      {
        id: "carousel-image-1",
        src: `/placeholders/placeholder-1.jpg`,
        alt: "Innovative architectural fashion design 1",
      },
      {
        id: "carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "Cutting-edge fashion structure 2",
      },
      {
        id: "carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "Fusion of architecture and style 3",
      },
    ],
  },
  participantsSection: {
    title: "Participants",
    description:
      "Discover all participating brands, designers, studio's and academies of GLUE amsterdam connected by design",
    participants: members,
    numberdisplayed: 10,
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Emma Johnson, a renowned architect known for her innovative sustainable designs.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Michael Chen, a fashion designer who incorporates architectural elements into his clothing lines.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Sophia Patel, a structural engineer who bridges the gap between fashion and architecture.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of David Lee, an urban planner who integrates fashion concepts into city designs.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Olivia Martinez, a textile innovator creating sustainable fabrics for both fashion and architecture.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Alexander Kim, a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Isabella Nguyen, a renowned figure in Amsterdam’s creative community, advocating for cross-disciplinary collaborations.",
        },
        description: `'𝘈𝘮𝘴𝘵𝘦𝘳𝘥𝘢𝘮 𝘪𝘴 𝘢 𝘧𝘢𝘯𝘵𝘢𝘴𝘵𝘪𝘤 𝘱𝘭𝘢𝘤𝘦 𝘸𝘩𝘦𝘳𝘦 𝘤𝘳𝘦𝘢𝘵𝘪𝘷𝘦𝘴 𝘢𝘮𝘰𝘯𝘨 𝘵𝘩𝘦𝘮𝘴𝘦𝘭𝘷𝘦𝘴 𝘱𝘳𝘰𝘷𝘪𝘥𝘦 𝘰𝘱𝘱𝘰𝘳𝘵𝘶𝘯𝘪𝘵𝘪𝘦𝘴 𝘧𝘰𝘳 𝘵𝘢𝘭𝘦𝘯𝘵𝘴’, says Marcel Wanders founder of @moooi.`,
        year: 2025,
      },
      {
        id: "ethan-carter",
        name: "Ethan Carter",
        image: {
          id: "ethan-carter-image",
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Ethan Carter, a biomimicry specialist applying nature-inspired designs to buildings and clothing.",
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
          src: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Portrait of Zoe Anderson, an acoustics expert designing spaces and garments that interact with sound.",
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
    curatedMembers: [
      { id: 1, name: "Alice Johnson", year: 2023, slug: "alice-johnson" },
      { id: 2, name: "Bob Smith", year: 2023, slug: "bob-smith" },
      { id: 3, name: "Charlie Brown", year: 2023, slug: "charlie-brown" },
      { id: 4, name: "Diana Ross", year: 2023, slug: "diana-ross" },
      { id: 5, name: "Eva Green", year: 2024, slug: "eva-green" },
      { id: 6, name: "Frank Sinatra", year: 2024, slug: "frank-sinatra" },
      { id: 7, name: "Grace Kelly", year: 2024, slug: "grace-kelly" },
      { id: 8, name: "Henry Ford", year: 2024, slug: "henry-ford" },
      { id: 9, name: "Iris West", year: 2025, slug: "iris-west" },
      { id: 10, name: "Jack Black", year: 2025, slug: "jack-black" },
      { id: 11, name: "Kate Winslet", year: 2025, slug: "kate-winslet" },
      { id: 12, name: "Liam Neeson", year: 2025, slug: "liam-neeson" },
      { id: 13, name: "Meryl Streep", year: 2023, slug: "meryl-streep" },
      { id: 14, name: "Nina Simone", year: 2023, slug: "nina-simone" },
      { id: 15, name: "Orson Welles", year: 2023, slug: "orson-welles" },
      { id: 16, name: "Pablo Picasso", year: 2023, slug: "pablo-picasso" },
      {
        id: 17,
        name: "Quentin Tarantino",
        year: 2024,
        slug: "quentin-tarantino",
      },
      { id: 18, name: "Rihanna Fenty", year: 2024, slug: "rihanna-fenty" },
      { id: 19, name: "Stan Lee", year: 2024, slug: "stan-lee" },
      { id: 20, name: "Taylor Swift", year: 2024, slug: "taylor-swift" },
      { id: 21, name: "Uma Thurman", year: 2025, slug: "uma-thurman" },
      {
        id: 22,
        name: "Vincent van Gogh",
        year: 2025,
        slug: "vincent-van-gogh",
      },
      { id: 23, name: "Walt Disney", year: 2025, slug: "walt-disney" },
      {
        id: 24,
        name: "Xena Warrior Princess",
        year: 2025,
        slug: "xena-warrior-princess",
      },
      { id: 25, name: "Yoko Ono", year: 2023, slug: "yoko-ono" },
      { id: 26, name: "Zack Snyder", year: 2023, slug: "zack-snyder" },
      { id: 27, name: "Adele Laurie", year: 2024, slug: "adele-laurie" },
      { id: 28, name: "Bruce Wayne", year: 2024, slug: "bruce-wayne" },
    ],
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
          src: `/placeholders/placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
        },
        description:
          "Our mission is to bridge the gap between architecture and fashion, creating innovative designs that push the boundaries of both fields.",
      },
      {
        id: "meet-the-team",
        title: "Meet the Team",
        image: {
          id: "meet-the-team-image",
          src: `/placeholders/placeholder-2.jpg`,
          alt: "Innovative architectural fashion design 1",
        },
        description:
          "Our diverse team of architects, fashion designers, and engineers work together to create groundbreaking concepts and products.",
      },
      {
        id: "glue-foundation",
        title: "GLUE Foundation",
        image: {
          id: "glue-foundation-image",
          src: `/placeholders/placeholder-3.jpg`,
          alt: "Innovative architectural fashion design 1",
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
          src: `/placeholders/placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
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
          src: `/placeholders/placeholder-2.jpg`,
          alt: "Innovative architectural fashion design 1",
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
    sponsors: [
      {
        id: "sponsor-1",
        name: "Sponsor 1",
        logo: {
          id: "sponsor-1-logo",
          src: `placeholders/user-placeholder-1.jpg`,
          alt: "Innovative architectural fashion design 1",
        },
        website: "https://sponsor1.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-2",
        name: "Sponsor 2",
        logo: {
          id: "sponsor-2-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 2",
        },
        website: "https://sponsor2.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-3",
        name: "Sponsor 3",
        logo: {
          id: "sponsor-3-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 3",
        },
        website: "https://sponsor3.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-4",
        name: "Sponsor 4",
        logo: {
          id: "sponsor-4-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 4",
        },
        website: "https://sponsor4.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-5",
        name: "Sponsor 5",
        logo: {
          id: "sponsor-5-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 5",
        },
        website: "https://sponsor5.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-6",
        name: "Sponsor 6",
        logo: {
          id: "sponsor-6-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 6",
        },
        website: "https://sponsor6.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-7",
        name: "Sponsor 7",
        logo: {
          id: "sponsor-7-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 7",
        },
        website: "https://sponsor7.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-8",
        name: "Sponsor 8",
        logo: {
          id: "sponsor-8-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 8",
        },
        website: "https://sponsor8.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-9",
        name: "Sponsor 9",
        logo: {
          id: "sponsor-9-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 9",
        },
        website: "https://sponsor9.com",
        sponsorT: "Sponsor Type",
      },
      {
        id: "sponsor-10",
        name: "Sponsor 10",
        logo: {
          id: "sponsor-10-logo",
          src: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
          alt: "Innovative architectural fashion design 10",
        },
        website: "https://sponsor10.com",
        sponsorT: "Sponsor Type",
      },
    ],
  },
  glueInternationalSection: {
    title: "GLUE International",
    subtitle: "GLUE arround the world",
    buttonText: "Visit GLUE International",
    website: "http://glue-international.com",
    buttonColor: "#10069f",
  },
};
