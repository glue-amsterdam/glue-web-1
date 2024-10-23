import { members } from "@/lib/mockMembers";
import { DatabaseContent } from "@/utils/about-types";

const getRandomNumber = () => Math.floor(Math.random() * 4) + 1;

export const mockAbout: DatabaseContent = {
  mainSection: {
    title: "GLUE connected by design",
    description:
      "A four days design-route for Amsterdam designers, the general public, architects, brands, labels, showrooms, galleries, academies and other colleagues.",
    slides: [
      {
        id: 1,
        src: `/placeholders/placeholder-1.jpg`,
        alt: "Innovative architectural fashion design 1",
      },
      {
        id: 2,
        src: `/placeholders/placeholder-2.jpg`,
        alt: "Cutting-edge fashion structure 2",
      },
      {
        id: 3,
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
  },
  citizens: [
    {
      id: 1,
      name: "Emma Johnson",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Emma Johnson is a renowned architect known for her innovative sustainable designs.",
      year: 2023,
    },
    {
      id: 2,
      name: "Michael Chen",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Michael Chen is a fashion designer who incorporates architectural elements into his clothing lines.",
      year: 2023,
    },
    {
      id: 3,
      name: "Sophia Patel",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Sophia Patel is a structural engineer who bridges the gap between fashion and architecture.",
      year: 2023,
    },
    {
      id: 4,
      name: "David Lee",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "David Lee is an urban planner who integrates fashion concepts into city designs.",
      year: 2024,
    },
    {
      id: 5,
      name: "Olivia Martinez",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Olivia Martinez is a textile innovator creating sustainable fabrics for both fashion and architecture.",
      year: 2024,
    },
    {
      id: 6,
      name: "Alexander Kim",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Alexander Kim is a 3D printing expert revolutionizing both architectural models and fashion prototypes.",
      year: 2024,
    },
    {
      id: 7,
      name: "Isabella Nguyen",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Isabella Nguyen is a virtual reality designer creating immersive architectural fashion experiences.",
      year: 2025,
    },
    {
      id: 8,
      name: "Ethan Carter",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Ethan Carter is a biomimicry specialist applying nature-inspired designs to both buildings and clothing.",
      year: 2025,
    },
    {
      id: 9,
      name: "Zoe Anderson",
      image: `/placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      description:
        "Zoe Anderson is an acoustics expert designing spaces and garments that interact with sound.",
      year: 2025,
    },
  ],
  curatedMembers: [
    { id: 1, name: "Alice Johnson", year: 2023 },
    { id: 2, name: "Bob Smith", year: 2023 },
    { id: 3, name: "Charlie Brown", year: 2023 },
    { id: 4, name: "Diana Ross", year: 2023 },
    { id: 5, name: "Eva Green", year: 2024 },
    { id: 6, name: "Frank Sinatra", year: 2024 },
    { id: 7, name: "Grace Kelly", year: 2024 },
    { id: 8, name: "Henry Ford", year: 2024 },
    { id: 9, name: "Iris West", year: 2025 },
    { id: 10, name: "Jack Black", year: 2025 },
    { id: 11, name: "Kate Winslet", year: 2025 },
    { id: 12, name: "Liam Neeson", year: 2025 },
    { id: 13, name: "Meryl Streep", year: 2023 },
    { id: 14, name: "Nina Simone", year: 2023 },
    { id: 15, name: "Orson Welles", year: 2023 },
    { id: 16, name: "Pablo Picasso", year: 2023 },
    { id: 17, name: "Quentin Tarantino", year: 2024 },
    { id: 18, name: "Rihanna Fenty", year: 2024 },
    { id: 19, name: "Stan Lee", year: 2024 },
    { id: 20, name: "Taylor Swift", year: 2024 },
    { id: 21, name: "Uma Thurman", year: 2025 },
    { id: 22, name: "Vincent van Gogh", year: 2025 },
    { id: 23, name: "Walt Disney", year: 2025 },
    { id: 24, name: "Xena Warrior Princess", year: 2025 },
    { id: 25, name: "Yoko Ono", year: 2023 },
    { id: 26, name: "Zack Snyder", year: 2023 },
    { id: 27, name: "Adele Laurie", year: 2024 },
    { id: 28, name: "Bruce Wayne", year: 2024 },
  ],
  infoItems: [
    {
      id: 1,
      title: "Mission Statement",
      image: `placeholders/placeholder-1.jpg`,
      description:
        "Our mission is to bridge the gap between architecture and fashion, creating innovative designs that push the boundaries of both fields.",
    },
    {
      id: 2,
      title: "Meet the Team",
      image: `placeholders/placeholder-2.jpg`,
      description:
        "Our diverse team of architects, fashion designers, and engineers work together to create groundbreaking concepts and products.",
    },
    {
      id: 3,
      title: "GLUE Foundation",
      image: `placeholders/placeholder-3.jpg`,
      description:
        "The GLUE Foundation supports emerging talents in the fields of architecture and fashion, fostering collaboration and innovation.",
    },
  ],
  pressItems: [
    {
      id: 1,
      title: "GLUE TV",
      image: `placeholders/placeholder-2.jpg`,
      description: `The third edition of GLUE TV was recorded in the studio of Pakhuis de Zwijger, the platform for social innovation & creation in Amsterdam. GLUE TV focussed this year on members that were invited to explore the definition of design, and stretch its limits a bit; the so called STICKY members. But we used the platform also to interview GLUE’s Creative Citizens of Honour: Wouter Valkenier, Marian Duff and Janine Toussaint. Due to the storm Poly some interviews took place online.

As part of the ‘Stretching the Definition of Design’ theme, Rubiah Balsem, Jeroen Junte, Gabrielle Kennedy, and Marsha Simon interviewed, amongst them: Georgie Frankel, Yamuna Forzani, Shahar Livne, Chen Yu Wang and Rink Schelling. Bas de Groot was in charge of editing. In the run-up to the design route in September, you can watch them via SALTO TV.

Get inspired and check out all interviews on Youtube or SALTO TV.`,
    },
    {
      id: 2,
      title: "Press",
      image: `placeholders/placeholder-1.jpg`,
      description: `Please contact Karin Dijksman for the most recent press release,
      high-res images and other press enquires.
      
      Dijksman Communicatie
      
      Westerstraat 187 (2nd floor), Amsterdam
      
      Karin Dijksman
      
      karin@dijksmancommunicatie.nl
      
      06 3100 6880`,
    },
  ],
  sponsors: [
    {
      id: 1,
      name: "Sponsor 1",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor1.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 2,
      name: "Sponsor 2",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor2.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 3,
      name: "Sponsor 3",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor3.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 4,
      name: "Sponsor 4",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor4.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 5,
      name: "Sponsor 5",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 6,
      name: "Sponsor 6",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 7,
      name: "Sponsor 7",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 8,
      name: "Sponsor 8",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 9,
      name: "Sponsor 9",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
    {
      id: 10,
      name: "Sponsor 10",
      logo: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      website: "https://sponsor5.com",
      sponsorT: "Sponsor Type",
    },
  ],
  glueInternational: {
    title: "GLUE International",
    subtitle: "GLUE arround the world",
    buttonText: "Visit GLUE International",
    website: "http://glue-international.com",
  },
};
