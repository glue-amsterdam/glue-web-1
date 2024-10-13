import { PressItem } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const pressItems: PressItem[] = [
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
  ];

  return NextResponse.json(pressItems);
}
