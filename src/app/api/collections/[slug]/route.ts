import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  COLLECTION_SELECT,
  attachProductLineRelations,
  mapCollection,
  type SupabaseProductComponentRow,
  type SupabaseProductLineMediaRow,
  type SupabaseProductLineRow,
  type SupabaseProductVariantRow,
  type SupabaseCollectionRow,
} from "../_utils";

type Params = { slug: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .schema("catalog")
    .from("collection")
    .select(COLLECTION_SELECT)
    .eq("slug", decodeURIComponent(slug))
    .single<SupabaseCollectionRow>();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;

    return NextResponse.json(
      {
        ok: false,
        schema: "catalog",
        table: "collection",
        slug,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
      { status },
    );
  }

  const { data: productLines, error: productLinesError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("*")
    .eq("collection_id", data.collection_id)
    .returns<SupabaseProductLineRow[]>();

  if (productLinesError) {
    return NextResponse.json(
      {
        ok: false,
        schema: "catalog",
        table: "product_line",
        slug,
        message: productLinesError.message,
        details: productLinesError.details,
        hint: productLinesError.hint,
        code: productLinesError.code,
      },
      { status: 500 },
    );
  }

  const productLineIds = productLines.map((productLine) => productLine.product_line_id);

  let media: SupabaseProductLineMediaRow[] = [];
  let components: SupabaseProductComponentRow[] = [];
  let variants: SupabaseProductVariantRow[] = [];

  if (productLineIds.length > 0) {
    const [mediaResult, componentsResult] = await Promise.all([
      supabase
        .schema("catalog")
        .from("product_line_media")
        .select("*")
        .in("product_line_id", productLineIds)
        .returns<SupabaseProductLineMediaRow[]>(),
      supabase
        .schema("catalog")
        .from("product_component")
        .select("*")
        .in("product_line_id", productLineIds)
        .returns<SupabaseProductComponentRow[]>(),
    ]);

    if (mediaResult.error) {
      return NextResponse.json(
        {
          ok: false,
          schema: "catalog",
          table: "product_line_media",
          slug,
          message: mediaResult.error.message,
          details: mediaResult.error.details,
          hint: mediaResult.error.hint,
          code: mediaResult.error.code,
        },
        { status: 500 },
      );
    }

    if (componentsResult.error) {
      return NextResponse.json(
        {
          ok: false,
          schema: "catalog",
          table: "product_component",
          slug,
          message: componentsResult.error.message,
          details: componentsResult.error.details,
          hint: componentsResult.error.hint,
          code: componentsResult.error.code,
        },
        { status: 500 },
      );
    }

    media = mediaResult.data;
    components = componentsResult.data;

    const componentIds = components.map((component) => component.component_id);

    if (componentIds.length > 0) {
      const variantsResult = await supabase
        .schema("catalog")
        .from("product_variant")
        .select("*")
        .in("component_id", componentIds)
        .returns<SupabaseProductVariantRow[]>();

      if (variantsResult.error) {
        return NextResponse.json(
          {
            ok: false,
            schema: "catalog",
            table: "product_variant",
            slug,
            message: variantsResult.error.message,
            details: variantsResult.error.details,
            hint: variantsResult.error.hint,
            code: variantsResult.error.code,
          },
          { status: 500 },
        );
      }

      variants = variantsResult.data;
    }
  }

  return NextResponse.json({
    ok: true,
    schema: "catalog",
    table: "collection",
    data: {
      ...mapCollection(data),
      productLines: attachProductLineRelations({
        productLines,
        media,
        components,
        variants,
      }),
    },
  });
}
