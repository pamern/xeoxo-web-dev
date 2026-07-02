import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("*")
    .limit(5);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        schema: "catalog",
        table: "product_line",
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
    table: "product_line",
    count: data.length,
    data,
  });
}
