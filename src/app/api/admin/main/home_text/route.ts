import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("home_text").select().limit(1);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] || null);
}

async function updateHomeText(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { label, color } = body;
  // Get the first record's id
  const { data: selectData, error: selectError } = await supabase
    .from("home_text")
    .select("id")
    .limit(1);
  if (selectError || !selectData || !selectData[0]) {
    return NextResponse.json(
      { error: selectError?.message || "No home_text record found" },
      { status: 500 }
    );
  }
  const id = selectData[0].id;
  const { data, error } = await supabase
    .from("home_text")
    .update({ label, color })
    .eq("id", id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] || null);
}

export const PATCH = updateHomeText;
export const PUT = updateHomeText;
