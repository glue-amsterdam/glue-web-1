import { generateTimestamps, getRandomNumber } from "@/mockConstants";
import { Sponsor } from "@/utils/sponsors-types";

export const mockSponsors: Sponsor[] = [
  {
    id: "sponsor-1",
    name: "Sponsor 1",
    logo: {
      image_url: `placeholders/user-placeholder-1.jpg`,
      alt: "Innovative architectural fashion design 1",
      image_name: "sponsor-1-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor1.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-2",
    name: "Sponsor 2",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 2",
      image_name: "sponsor-2-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor2.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-3",
    name: "Sponsor 3",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 3",
      image_name: "sponsor-3-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor3.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-4",
    name: "Sponsor 4",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 4",
      image_name: "sponsor-4-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor4.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-5",
    name: "Sponsor 5",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 5",
      image_name: "sponsor-5-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor5.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-6",
    name: "Sponsor 6",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 6",
      image_name: "sponsor-6-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor6.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-7",
    name: "Sponsor 7",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 7",
      image_name: "sponsor-7-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor7.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-8",
    name: "Sponsor 8",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 8",
      image_name: "sponsor-8-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor8.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-9",
    name: "Sponsor 9",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 9",
      image_name: "sponsor-9-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor9.com",
    sponsorT: "Sponsor Type",
  },
  {
    id: "sponsor-10",
    name: "Sponsor 10",
    logo: {
      image_url: `placeholders/user-placeholder-${getRandomNumber()}.jpg`,
      alt: "Innovative architectural fashion design 10",
      image_name: "sponsor-10-logo",
      ...generateTimestamps(),
    },
    website: "https://sponsor10.com",
    sponsorT: "Sponsor Type",
  },
];
