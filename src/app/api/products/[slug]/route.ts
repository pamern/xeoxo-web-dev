import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  attachProductLineRelations,
  type SupabaseProductComponentRow,
  type SupabaseProductLineMediaRow,
  type SupabaseProductLineRow,
  type SupabaseProductVariantRow,
} from "../../collections/_utils";

type Params = { slug: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: productLine, error } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("*")
    .eq("slug", decodeURIComponent(slug))
    .single<SupabaseProductLineRow>();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json(
      {
        ok: false,
        slug,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
      { status },
    );
  }

  const productLineId = productLine.product_line_id;

  const [mediaResult, componentsResult, collectionResult] = await Promise.all([
    supabase
      .schema("catalog")
      .from("product_line_media")
      .select("*")
      .eq("product_line_id", productLineId)
      .returns<SupabaseProductLineMediaRow[]>(),
    supabase
      .schema("catalog")
      .from("product_component")
      .select("*")
      .eq("product_line_id", productLineId)
      .returns<SupabaseProductComponentRow[]>(),
    supabase
      .schema("catalog")
      .from("collection")
      .select("collection_id,collection_name,slug")
      .eq("collection_id", productLine.collection_id)
      .maybeSingle(),
  ]);

  if (mediaResult.error || componentsResult.error || collectionResult.error) {
    const currentError =
      mediaResult.error ?? componentsResult.error ?? collectionResult.error;

    return NextResponse.json(
      {
        ok: false,
        slug,
        message: currentError?.message ?? "Unknown error",
        details: currentError?.details ?? null,
        hint: currentError?.hint ?? null,
        code: currentError?.code ?? null,
      },
      { status: 500 },
    );
  }

  let variants: SupabaseProductVariantRow[] = [];
  const componentIds = componentsResult.data.map((component) => component.component_id);

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

  const { data: relatedProductLines, error: relatedError } = await supabase
    .schema("catalog")
    .from("product_line")
    .select("*")
    .eq("collection_id", productLine.collection_id)
    .neq("product_line_id", productLineId)
    .limit(4)
    .returns<SupabaseProductLineRow[]>();

  if (relatedError) {
    return NextResponse.json(
      {
        ok: false,
        slug,
        message: relatedError.message,
        details: relatedError.details,
        hint: relatedError.hint,
        code: relatedError.code,
      },
      { status: 500 },
    );
  }

  const relatedIds = relatedProductLines.map((item) => item.product_line_id);
  let relatedMedia: SupabaseProductLineMediaRow[] = [];
  let relatedComponents: SupabaseProductComponentRow[] = [];
  let relatedVariants: SupabaseProductVariantRow[] = [];

  if (relatedIds.length > 0) {
    const [relatedMediaResult, relatedComponentsResult] = await Promise.all([
      supabase
        .schema("catalog")
        .from("product_line_media")
        .select("*")
        .in("product_line_id", relatedIds)
        .returns<SupabaseProductLineMediaRow[]>(),
      supabase
        .schema("catalog")
        .from("product_component")
        .select("*")
        .in("product_line_id", relatedIds)
        .returns<SupabaseProductComponentRow[]>(),
    ]);

    if (relatedMediaResult.error || relatedComponentsResult.error) {
      const currentError =
        relatedMediaResult.error ?? relatedComponentsResult.error;

      return NextResponse.json(
        {
          ok: false,
          slug,
          message: currentError?.message ?? "Unknown error",
          details: currentError?.details ?? null,
          hint: currentError?.hint ?? null,
          code: currentError?.code ?? null,
        },
        { status: 500 },
      );
    }

    relatedMedia = relatedMediaResult.data;
    relatedComponents = relatedComponentsResult.data;

    const relatedComponentIds = relatedComponents.map((component) => component.component_id);
    if (relatedComponentIds.length > 0) {
      const relatedVariantsResult = await supabase
        .schema("catalog")
        .from("product_variant")
        .select("*")
        .in("component_id", relatedComponentIds)
        .returns<SupabaseProductVariantRow[]>();

      if (relatedVariantsResult.error) {
        return NextResponse.json(
          {
            ok: false,
            slug,
            message: relatedVariantsResult.error.message,
            details: relatedVariantsResult.error.details,
            hint: relatedVariantsResult.error.hint,
            code: relatedVariantsResult.error.code,
          },
          { status: 500 },
        );
      }

      relatedVariants = relatedVariantsResult.data;
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      productLine: attachProductLineRelations({
        productLines: [productLine],
        media: mediaResult.data,
        components: componentsResult.data,
        variants,
      })[0],
      relatedProductLines: attachProductLineRelations({
        productLines: relatedProductLines,
        media: relatedMedia,
        components: relatedComponents,
        variants: relatedVariants,
      }),
      collection: collectionResult.data,
    },
  });
}
