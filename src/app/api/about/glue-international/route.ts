import { GlueInternationalContent } from "@/utils/about-types";
import { NextResponse } from "next/server";

export async function GET() {
  const glueInternationalContent: GlueInternationalContent = {
    title: "GLUE International",
    buttonText: "Visit GLUE International",
    website: "http://glue-international.com",
  };

  return NextResponse.json(glueInternationalContent);
}
