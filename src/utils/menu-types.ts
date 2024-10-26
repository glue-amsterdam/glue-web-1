export interface MainSection {
  mainColors: MainColors;
  mainMenu: MainMenuItem[];
  mainLinks: Record<string, MainLink>;
}
export interface MainMenuItem {
  label: string;
  section: string;
  className: string;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  href: string;
}

export interface MainColors {
  box1: string;
  box2: string;
  box3: string;
  box4: string;
  triangle: string;
}

export interface MainLink {
  link?: string;
}
