import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ProductDetail } from "@/components/organisms/ProductDetail";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { PRODUCTS } from "@/data/catalog";
import { getProductBySlug, getRelatedProducts } from "@/data/queries";
import type { ApiResponse } from "@/types/api.types";
import type { ProductDetailDto } from "@/types/product-api.types";
import type { Product } from "@/types/product.types";
import { ReviewsSection } from "@/components/organisms/ReviewsSection/ReviewsSection";

type Params = { slug: string };

export const dynamic = "force-dynamic";

async function getApiProduct(slug: string) {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const forwardedProtocol = headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProtocol ||
    (process.env.NODE_ENV === "development" ||
    host?.includes("localhost") ||
    host?.startsWith("127.0.0.1")
      ? "http"
      : "https");

  if (!host) {
    console.error("[products/[slug]] Missing host header", { slug });
    return null;
  }

  try {
    const url = `${protocol}://${host}/api/v1/product-lines/${encodeURIComponent(slug)}`;
    console.info("[products/[slug]] fetch product detail", { slug, url });
    const response = await fetch(url, { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<ProductDetailDto>;

    if (!response.ok || !payload.success || !payload.data) {
      console.error("[products/[slug]] product detail api failed", {
        slug,
        status: response.status,
        message: payload.message,
        error: payload.error,
      });
      return null;
    }

    return payload.data;
  } catch (error) {
    console.error("[products/[slug]] product detail fetch crashed", {
      slug,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

function safeImageSrc(src?: string | null) {
  if (!src) {
    return "/images/placeholder.png";
  }

  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }

  console.warn("[products/[slug]] unsafe image src from api", { src });
  return "/images/placeholder.png";
}

function mapApiProduct(product: ProductDetailDto): Product {
  return {
    id: String(product.product_line_id),
    slug: product.slug,
    name: product.name,
    price: product.price,
    images: product.media.length
      ? product.media.map((media) => safeImageSrc(media.url))
      : ["/images/placeholder.png"],
    categorySlug: "api",
    gender: "nu",
    description: product.description ?? "",
    sizes: product.sizes.map((size) => size.size_name).filter(Boolean),
    colors: product.color
      ? [{ name: product.color.color_name, hex: product.color.color_code }]
      : [{ name: "Mặc định", hex: "#111111" }],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apiProduct = await getApiProduct(slug);
  const product = apiProduct ? mapApiProduct(apiProduct) : getProductBySlug(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const apiProduct = await getApiProduct(slug);
  if (!apiProduct) notFound();
  const product = mapApiProduct(apiProduct);
  const relatedProducts = getRelatedProducts(product);
  const recommendedProducts = PRODUCTS.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-site px-6 pb-12 pt-5 xl:px-[100px]">
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: ROUTES.HOME },
            { label: product.gender === "nam" ? "Đồ Nam" : "Đồ Nữ", href: ROUTES.PRODUCTS },
            { label: product.name },
          ]}
          className="mb-6"
        />
        <ProductDetail product={product} apiProduct={apiProduct} relatedProducts={relatedProducts} />
      </div>
      <StripDivider />
      <ProductDescription product={product} />
      <RecommendationSection products={recommendedProducts} />
      <StripDivider />
      <ReviewsSection product={product} apiProduct={apiProduct} />
    </SiteLayout>
  );
}

function StripDivider() {
  return (
    <div
      aria-hidden
      className="h-[25px] w-full bg-cover bg-center"
      style={{ backgroundImage: "url(/images/strip-section-divider.png)" }}
    />
  );
}

function ProductDescription({ product }: { product: Product }) {
  const detailRows = [
    ["Bộ sưu tập", "CỔ ĐỊNH"],
    ["Chất liệu", "70% gấm dệt, 20% sợi ánh mềm, 10% sợi giữ phom."],
    ["Kiểu dáng", "Áo dáng ngắn hiện đại, tôn dáng và phù hợp nhiều dịp."],
    ["Phù hợp với", "Gặp gỡ, sự kiện, tiệc tối, hoặc dịp cần trang phục chỉn chu."],
    ["Tính năng", "Giữ phom tốt, bề mặt gấm ánh nhẹ, sang trọng."],
    ["Bảo quản", "Giặt tay hoặc giặt nhẹ, hạn chế vắt mạnh, ủi nhiệt độ thấp."],
  ];

  return (
    <section className="mx-auto w-full max-w-site px-6 pb-10 pt-8 xl:px-[100px]">
      <h2 className="mb-5 text-center text-[32px] font-bold uppercase">Mô tả sản phẩm</h2>
      <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
        <div>
          <h3 className="mb-3 text-2xl font-bold">{product.name}</h3>
          <p className="mb-6 text-sm font-light leading-relaxed text-foreground/80">
            {product.description} Thiết kế được xử lý theo tinh thần Á Đông đương đại,
            chú trọng phom dáng, cảm giác mặc và độ chỉn chu trong từng chi tiết.
          </p>
          <div className="flex flex-col border-y border-[#d9d9d9]">
            {detailRows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-[#d9d9d9] py-3 last:border-b-0">
                <span className="text-sm font-bold">{label}</span>
                <span className="text-sm font-light leading-relaxed text-foreground/75">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-lg font-bold">* Proudly Made In Vietnam</p>
        </div>

        <div className="grid overflow-hidden rounded-[20px] shadow-lg md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-[3/4]">
            <Image src="/images/material-gam-tan-chau.png" alt="" fill sizes="480px" className="object-cover" />
          </div>
          <div className="relative aspect-[4/3] md:aspect-[3/4]">
            <Image src={product.images[0]} alt={product.name} fill sizes="480px" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RecommendationSection({ products }: { products: Product[] }) {
  return (
    <section className="mx-auto w-full max-w-site px-6 pb-10 pt-7 xl:px-[100px]">
      <h2 className="mb-6 text-center text-[32px] font-bold uppercase">Có thể bạn cũng thích</h2>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
