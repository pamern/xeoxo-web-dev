import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/organisms/ProductGrid";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { CATEGORIES } from "@/data/catalog";
import { getProductsByCategory } from "@/data/queries";
import type { Gender } from "@/types/product.types";
//! TODO: Chỉnh sỬa lại router cho đúng theo sitemap, danh-muc thành categories. Không cần chi tiết ra từng department, nhưng để mock thì OK 
type Params = { gender: string; category: string };

function findCategory(gender: string, category: string) {
  return CATEGORIES.find((c) => c.gender === gender && c.slug === category);
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ gender: c.gender, category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gender, category } = await params;
  const found = findCategory(gender, category);
  if (!found) return { title: "Không tìm thấy danh mục" };
  return {
    title: found.name,
    description: `Sản phẩm ${found.name} của XÉO XỌ.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { gender, category } = await params;
  const found = findCategory(gender, category);
  if (!found) notFound();

  const products = getProductsByCategory(found.slug);
  const genderLabel = (gender as Gender) === "nu" ? "Đồ nữ" : "Đồ nam";

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-site px-6 py-10 xl:px-[100px]">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          {genderLabel} / <span className="text-foreground">{found.name}</span>
        </nav>
        <h1 className="mb-8 text-3xl font-medium uppercase md:text-4xl">{found.name}</h1>
        <ProductGrid products={products} />
      </div>
    </SiteLayout>
  );
}
