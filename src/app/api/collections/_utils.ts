export type SupabaseCollectionRow = {
  collection_id: string | number;
  collection_name: string | null;
  description: string | null;
  media_id: string | number | null;
  content_json: unknown;
  season: string | null;
  launch_date: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  slug: string | null;
};

export type SupabaseProductLineRow = {
  product_line_id: string | number;
  collection_id: string | number | null;
  [key: string]: unknown;
};

export type SupabaseProductLineMediaRow = {
  product_line_id: string | number | null;
  [key: string]: unknown;
};

export type SupabaseProductComponentRow = {
  component_id: string | number;
  product_line_id: string | number | null;
  [key: string]: unknown;
};

export type SupabaseProductVariantRow = {
  component_id: string | number | null;
  [key: string]: unknown;
};

export function mapCollection(row: SupabaseCollectionRow) {
  return {
    id: row.collection_id,
    slug: row.slug,
    name: row.collection_name,
    description: row.description,
    mediaId: row.media_id,
    content: row.content_json,
    season: row.season,
    launchDate: row.launch_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function attachProductLineRelations({
  productLines,
  media,
  components,
  variants,
}: {
  productLines: SupabaseProductLineRow[];
  media: SupabaseProductLineMediaRow[];
  components: SupabaseProductComponentRow[];
  variants: SupabaseProductVariantRow[];
}) {
  return productLines.map((productLine) => {
    const lineComponents = components.filter(
      (component) => component.product_line_id === productLine.product_line_id,
    );
    const componentIds = new Set(lineComponents.map((component) => component.component_id));

    return {
      ...productLine,
      media: media.filter((item) => item.product_line_id === productLine.product_line_id),
      components: lineComponents.map((component) => ({
        ...component,
        variants: variants.filter(
          (variant) => variant.component_id !== null && componentIds.has(variant.component_id),
        ),
      })),
    };
  });
}

export const COLLECTION_SELECT = [
  "collection_id",
  "collection_name",
  "description",
  "media_id",
  "content_json",
  "season",
  "launch_date",
  "status",
  "created_at",
  "updated_at",
  "slug",
].join(",");
