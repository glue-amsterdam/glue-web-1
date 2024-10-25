import { Member } from "@/utils/member-types";

export const members: Member[] = [
  {
    id: "50654654",
    slug: "vanmokum",
    name: "VANMOKUM",
    shortDescription: "High-end lighting and furniture brands",
    description:
      "At VANMOKUM we take care of the development, manufacturing and distribution of high-end lighting and furniture brands:\n\nGRAYPANTS\nFRAMA\nPIET HEIN EEK LIGHTING\nAY ILLUMINATE\nSELETTI\nJAPTH\n\nAt GLUE'24, our PANDVANMOKUM will also be the place to discover work from external brands and designers:\n\nNLXLxSTUDIO JOB\nARTLINEZ\nJAN WILLEM KALDENBACH\nSUPA DUPA STUDIO\nSTUDIO RENS\nVANJOOSTxKEGEL\nDIRK DUIF\nTEUN ZWETS",
    address: "VANMOKUM studio\n\nMeeuwenlaan 126 B\n1021 JN",
    visitingHours: {
      Thursday: [
        { open: "09:30", close: "13:00" },
        { open: "13:00", close: "23:45" },
      ],
      Friday: [
        { open: "09:30", close: "13:00" },
        { open: "13:00", close: "23:45" },
      ],
      Saturday: [{ open: "09:30", close: "13:00" }],
      Sunday: [],
    },
    phoneNumber: ["+31 (0)20 21 03 101"],
    visibleEmail: ["press@vanmokum.com"],
    visibleWebsite: ["/members/vanmokum"],
    socialMedia: {
      instagram: ["https://www.instagram.com/vanmokum/"],
      facebook: ["https://www.facebook.com/VANMOKUM/"],
      linkedin: ["https://www.linkedin.com/company/vanmokum"],
    },
    images: [
      {
        id: "vanmokum-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "vanmokum profile image 1",
      },
      {
        id: "vanmokum-carousel-image-2",
        src: `/placeholders/user-placeholder-2.jpg`,
        alt: "vanmokum profile image 2",
      },
      {
        id: "vanmokum-carousel-image-3",
        src: `/placeholders/user-placeholder-3.jpg`,
        alt: "vanmokum profile image 3",
      },
    ],
  },
  {
    id: "50654655",
    slug: "studio-job",
    name: "STUDIO JOB",
    shortDescription: "Artistic design studio",
    description:
      "STUDIO JOB blends fine art and design to create extraordinary pieces. Known for intricate sculptures and limited-edition works.",
    address: "STUDIO JOB\n\nJobstraat 12\n1050 NL",
    visitingHours: {
      Thursday: [{ open: "10:00", close: "18:00" }],
      Friday: [{ open: "10:00", close: "20:00" }],
      Saturday: [{ open: "10:00", close: "18:00" }],
      Sunday: [],
    },
    phoneNumber: ["+31 (0)20 22 04 102"],
    visibleEmail: ["info@studiojob.com"],
    visibleWebsite: ["/members/studio-job"],
    socialMedia: {
      instagram: ["https://www.instagram.com/studiojob/"],
      facebook: ["https://www.facebook.com/studiojobdesign/"],
      linkedin: ["https://www.linkedin.com/company/studiojob"],
    },
    images: [
      {
        id: "studio-job-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "studio job profile image 1",
      },
      {
        id: "studio-job-carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "studio job profile image 2",
      },
      {
        id: "studio-job-carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "studio job profile image 3",
      },
    ],
  },
  {
    id: "5065465985",
    slug: "studio-rens",
    name: "STUDIO RENS",
    shortDescription: "Color-focused design studio",
    description:
      "STUDIO RENS explores the essence of color, collaborating with various brands to challenge the perception of material and color.",
    address: "STUDIO RENS\n\nKleurenstraat 15\n1071 DD",
    visitingHours: {
      Thursday: [{ open: "09:00", close: "17:00" }],
      Friday: [{ open: "09:00", close: "21:00" }],
      Saturday: [{ open: "09:00", close: "17:00" }],
      Sunday: [],
    },
    phoneNumber: ["+31 (0)20 21 01 303"],
    visibleEmail: ["info@studiorens.com"],
    visibleWebsite: ["/members/studio-rens"],
    socialMedia: {
      instagram: ["https://www.instagram.com/studiorens/"],
      facebook: ["https://www.facebook.com/studiorensofficial/"],
      linkedin: ["https://www.linkedin.com/company/studiorens"],
    },
    images: [
      {
        id: "studio-rens-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "studio rens profile image 1",
      },
      {
        id: "studio-rens-carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "studio rens profile image 2",
      },
      {
        id: "studio-rens-carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "studio rens profile image 3",
      },
    ],
  },
  {
    id: "5065455",
    slug: "graypants",
    name: "GRAYPANTS",
    shortDescription: "Sustainable lighting design",
    description:
      "GRAYPANTS creates lighting solutions using sustainable materials, blending artistry with responsible production.",
    address: "GRAYPANTS Studio\n\nLichtstraat 5\n2013 TW",
    visitingHours: {
      Friday: [{ open: "11:00", close: "22:00" }],
      Saturday: [{ open: "11:00", close: "19:00" }],
      Sunday: [{ open: "11:00", close: "19:00" }],
    },
    phoneNumber: [
      "+31 (0)20 23 01 104",
      "+31 (0)20 23 01 104",
      "+31 (0)20 23 01 104",
    ],
    visibleEmail: ["info@graypants.com"],
    visibleWebsite: ["/members/graypants"],
    socialMedia: {
      instagram: ["https://www.instagram.com/graypants/"],
      facebook: ["https://www.facebook.com/graypantslighting/"],
      linkedin: ["https://www.linkedin.com/company/graypants"],
    },
    images: [
      {
        id: "graypants-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "graypants profile image 1",
      },
      {
        id: "graypants-carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "graypants profile image 2",
      },
      {
        id: "graypants-carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "graypants profile image 3",
      },
    ],
  },
  {
    id: "50654659",
    slug: "frama",
    name: "FRAMA",
    shortDescription: "Holistic design studio",
    description:
      "FRAMA creates interior products and spaces that embody a sense of timelessness, merging the realms of architecture and design.",
    address: "FRAMA Studio\n\nDesignweg 18\n3034 HG",
    visitingHours: {
      Thursday: [{ open: "10:00", close: "19:00" }],
      Friday: [{ open: "10:00", close: "23:00" }],
      Saturday: [{ open: "10:00", close: "19:00" }],
    },
    phoneNumber: ["+31 (0)20 24 01 202"],
    visibleEmail: ["contact@frama.com"],
    visibleWebsite: ["/members/frama"],
    socialMedia: {
      instagram: ["https://www.instagram.com/framacph/"],
      facebook: ["https://www.facebook.com/framadesign/"],
      linkedin: ["https://www.linkedin.com/company/framacph"],
    },
    images: [
      {
        id: "frama-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "frama profile image 1",
      },
      {
        id: "frama-carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "frama profile image 2",
      },
      {
        id: "frama-carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "frama profile image 3",
      },
    ],
  },
  {
    id: "5065465555",
    slug: "ay-illuminate",
    name: "AY ILLUMINATE",
    shortDescription: "Creative lighting solutions",
    description:
      "AY ILLUMINATE specializes in creating handmade lighting fixtures that bring warmth and beauty to any space.",
    address: "AY ILLUMINATE\n\nLichtstraat 45\n2013 TU",
    visitingHours: {
      Thursday: [{ open: "10:00", close: "20:00" }],
      Friday: [{ open: "10:00", close: "20:00" }],
      Saturday: [{ open: "10:00", close: "20:00" }],
    },
    phoneNumber: ["+31 (0)20 25 01 505"],
    visibleEmail: ["info@ayilluminate.com"],
    visibleWebsite: ["/members/ay-illuminate"],
    socialMedia: {
      instagram: ["https://www.instagram.com/ayilluminate/"],
      facebook: ["https://www.facebook.com/ayilluminate"],
      linkedin: ["https://www.linkedin.com/company/ay-illuminate"],
    },
    images: [
      {
        id: "ay-illuminate-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "ay illuminate profile image 1",
      },
      {
        id: "ay-illuminate-carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "ay illuminate profile image 2",
      },
      {
        id: "ay-illuminate-carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "ay illuminate profile image 3",
      },
    ],
  },
  {
    id: "5065455115",
    slug: "seletti",
    name: "SELETTI",
    shortDescription: "Innovative design products",
    description:
      "SELETTI offers a playful and provocative range of design products, merging art and functionality in unexpected ways.",
    address: "SELETTI Studio\n\nDesignstraat 78\n1019 KJ",
    visitingHours: {
      Thursday: [{ open: "11:00", close: "20:00" }],
      Friday: [{ open: "11:00", close: "20:00" }],
      Saturday: [{ open: "11:00", close: "20:00" }],
    },
    phoneNumber: ["+31 (0)20 22 12 343"],
    visibleEmail: ["info@seletti.com"],
    visibleWebsite: ["/members/seletti"],
    socialMedia: {
      instagram: ["https://www.instagram.com/seletti/"],
      facebook: ["https://www.facebook.com/seletti/"],
      linkedin: ["https://www.linkedin.com/company/seletti"],
    },
    images: [
      {
        id: "seletti-carousel-image-1",
        src: `/placeholders/user-placeholder-1.jpg`,
        alt: "seletti profile image 1",
      },
      {
        id: "seletti-carousel-image-2",
        src: `/placeholders/placeholder-2.jpg`,
        alt: "seletti profile image 2",
      },
      {
        id: "seletti-carousel-image-3",
        src: `/placeholders/placeholder-3.jpg`,
        alt: "seletti profile image 3",
      },
    ],
  },
];
