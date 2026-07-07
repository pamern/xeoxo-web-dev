import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COLLECTION_SELECT, mapCollection, type SupabaseCollectionRow } from "./_utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  const supabase = await createClient();
  let query = supabase
    .schema("catalog")
    .from("collection")
    .select(COLLECTION_SELECT)
    .order("launch_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (Number.isFinite(limit) && limit && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query.returns<SupabaseCollectionRow[]>();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        schema: "catalog",
        table: "collection",
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    schema: "catalog",
    table: "collection",
    count: data.length,
    data: data.map(mapCollection),
  });
}
