import { fail, ok } from "@/lib/api-response";
import { getRelatedProducts } from "@/features/product/product-server.service";

export const dynamic = "force-dynamic";

type Params = {
  slug: string;
};

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const related = await getRelatedProducts(decodedSlug, 5);
    return ok(related, "Lay san pham lien quan thanh cong.");
  } catch (error) {
    console.error("[product-lines/[slug]/related/GET] failed", error);
    return fail(
      "Khong the lay san pham lien quan.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
