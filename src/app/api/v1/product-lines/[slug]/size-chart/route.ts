import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";

type Params = {
  slug: string;
};

function formatMeasurement(row: {
  measurement_value: number | null;
  measurement_min: number | null;
  measurement_max: number | null;
}) {
  if (row.measurement_value !== null && row.measurement_value !== undefined) {
    return String(row.measurement_value);
  }

  if (row.measurement_min !== null && row.measurement_max !== null) {
    return `${row.measurement_min} - ${row.measurement_max}`;
  }

  return "";
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const admin = await createClient();

    const { data: productLine, error: productError } = await admin
      .schema("catalog")
      .from("product_line")
      .select("product_line_id, status")
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (productError) {
      throw new Error(productError.message);
    }

    if (!productLine) {
      return fail("Khong tim thay san pham.", 404);
    }

    let { data: sizeChart, error: chartError } = await admin
      .schema("catalog")
      .from("size_chart")
      .select("size_chart_id, chart_name, description")
      .eq("product_line_id", productLine.product_line_id)
      .eq("is_active", true)
      .maybeSingle();

    if (chartError) {
      throw new Error(chartError.message);
    }

    if (!sizeChart) {
      const { data: primaryCategory, error: categoryError } = await admin
        .schema("catalog")
        .from("line_category")
        .select("category_id")
        .eq("product_line_id", productLine.product_line_id)
        .eq("is_primary", true)
        .maybeSingle();

      if (categoryError) {
        throw new Error(categoryError.message);
      }

      if (primaryCategory) {
        const { data: chartCategory, error: chartCategoryError } = await admin
          .schema("catalog")
          .from("size_chart_category")
          .select("size_chart_id")
          .eq("category_id", primaryCategory.category_id)
          .limit(1)
          .maybeSingle();

        if (chartCategoryError) {
          throw new Error(chartCategoryError.message);
        }

        if (chartCategory) {
          const result = await admin
            .schema("catalog")
            .from("size_chart")
            .select("size_chart_id, chart_name, description")
            .eq("size_chart_id", chartCategory.size_chart_id)
            .eq("is_active", true)
            .maybeSingle();

          if (result.error) {
            throw new Error(result.error.message);
          }

          sizeChart = result.data;
        }
      }
    }

    if (!sizeChart) {
      return fail("Khong tim thay bang kich thuoc.", 404);
    }

    const { data: sizeOptions, error: sizeError } = await admin
      .schema("catalog")
      .from("size_option")
      .select("size_option_id, size_name")
      .eq("size_chart_id", sizeChart.size_chart_id)
      .order("size_option_id", { ascending: true });

    if (sizeError) {
      throw new Error(sizeError.message);
    }

    const sizeOptionIds = (sizeOptions ?? []).map((size) => size.size_option_id);
    const { data: measurements, error: measurementError } = sizeOptionIds.length
      ? await admin
          .schema("catalog")
          .from("size_measurement")
          .select(
            "size_option_id, measurement_type_id, measurement_value, measurement_min, measurement_max, measurement_order",
          )
          .in("size_option_id", sizeOptionIds)
          .order("measurement_order", { ascending: true })
      : { data: [], error: null };

    if (measurementError) {
      throw new Error(measurementError.message);
    }

    const measurementTypeIds = Array.from(
      new Set((measurements ?? []).map((row) => row.measurement_type_id)),
    );
    const { data: measurementTypes, error: typeError } = measurementTypeIds.length
      ? await admin
          .schema("catalog")
          .from("measurement_type")
          .select("measurement_type_id, measurement_name, unit")
          .in("measurement_type_id", measurementTypeIds)
      : { data: [], error: null };

    if (typeError) {
      throw new Error(typeError.message);
    }

    const typeMap = new Map(
      (measurementTypes ?? []).map((type) => [
        Number(type.measurement_type_id),
        type,
      ]),
    );
    const columns = measurementTypeIds
      .map((id) => typeMap.get(Number(id)))
      .filter(Boolean)
      .map((type) => ({
        measurement_type_id: Number(type!.measurement_type_id),
        measurement_name: type!.measurement_name,
        unit: type!.unit,
      }));

    return ok(
      {
        chart_name: sizeChart.chart_name,
        description: sizeChart.description,
        columns,
        rows: (sizeOptions ?? []).map((size) => ({
          size_option_id: Number(size.size_option_id),
          size_name: size.size_name,
          values: (measurements ?? [])
            .filter((row) => row.size_option_id === size.size_option_id)
            .map((row) => ({
              measurement_type_id: Number(row.measurement_type_id),
              value: formatMeasurement(row),
            })),
        })),
      },
      "Lay bang kich thuoc thanh cong.",
    );
  } catch (error) {
    console.error("[size-chart/GET]", error);
    return fail(
      "Khong the tai bang kich thuoc.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
