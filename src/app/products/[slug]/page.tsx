import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ProductDetail } from "@/components/organisms/ProductDetail";
import { ReviewsSection } from "@/components/organisms/ReviewsSection/ReviewsSection";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { fetchProductBySlugFromApi } from "@/data/products.api";
import type { ApiResponse } from "@/types/api.types";
import type { ProductDetailDto } from "@/types/product-api.types";
import type { Product } from "@/types/product.types";

type Params = { slug: string };

export const dynamic = "force-dynamic";

async function getApiProduct(slug: string) {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const forwardedProtocol = headerStore
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    forwardedProtocol ||
    (process.env.NODE_ENV === "development" ||
    host?.includes("localhost") ||
    host?.startsWith("127.0.0.1")
      ? "http"
      : "https");

  if (!host) {
    return null;
  }

  try {
    const url = `${protocol}://${host}/api/v1/product-lines/${encodeURIComponent(slug)}`;
    const response = await fetch(url, { cache: "no-store" });
    const payload = (await response.json()) as ApiResponse<ProductDetailDto>;

    if (!response.ok || !payload.success || !payload.data) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

function safeImageSrc(src?: string | null) {
  if (!src) {
    return "/images/placeholder.png";
  }

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }

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
  const [apiProduct, result] = await Promise.all([
    getApiProduct(slug),
    fetchProductBySlugFromApi(slug),
  ]);
  const product =
    result?.product ?? (apiProduct ? mapApiProduct(apiProduct) : null);

  if (!product) {
    return { title: "Không tìm thấy sản phẩm" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [apiProduct, result] = await Promise.all([
    getApiProduct(slug),
    fetchProductBySlugFromApi(slug),
  ]);

  if (!apiProduct) {
    notFound();
  }

  const product = result?.product ?? mapApiProduct(apiProduct);
  const relatedProducts = result?.relatedProducts ?? [];
  const recommendedProducts = relatedProducts.slice(0, 4);

  return (
    <SiteLayout>
      <div
        className="product-page-shell pb-12"
        style={{ paddingBlockStart: "var(--product-page-top-offset)" }}
      >
        <Breadcrumbs
          items={[
            { label: "Trang chủ", href: ROUTES.HOME },
            {
              label: result?.collection?.collection_name ?? "Sản phẩm",
              href: result?.collection?.slug
                ? ROUTES.COLLECTION(result.collection.slug)
                : ROUTES.PRODUCTS,
            },
            { label: product.name },
          ]}
          className="mb-6"
        />
        <ProductDetail
          product={product}
          apiProduct={apiProduct}
          relatedProducts={relatedProducts}
        />
      </div>
      <StripDivider />
      <ProductDescription
        product={product}
        collectionName={result?.collection?.collection_name ?? null}
        materialName={apiProduct.material?.material_name ?? null}
        careInstruction={apiProduct.material?.care_instruction ?? null}
      />
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
      className="w-full bg-cover bg-center"
      style={{
        backgroundImage: "url(/images/strip-section-divider.png)",
        height: "var(--product-divider-height)",
      }}
    />
  );
}

function ProductDescription({
  product,
  collectionName,
  materialName,
  careInstruction,
}: {
  product: Product;
  collectionName: string | null;
  materialName: string | null;
  careInstruction: string | null;
}) {
  const detailRows = [
    ["Bộ sưu tập", collectionName ?? "Cập nhật từ dữ liệu sản phẩm"],
    [
      "Chất liệu",
      materialName ??
        "Thông tin chất liệu sẽ được đồng bộ từ dữ liệu sản phẩm.",
    ],
    ["Kiểu dáng", "Thông tin kiểu dáng sẽ được đồng bộ từ dữ liệu sản phẩm."],
    [
      "Phù hợp với",
      "Thông tin usage context sẽ được đồng bộ từ dữ liệu sản phẩm.",
    ],
    ["Tính năng", "Thông tin features sẽ được đồng bộ từ dữ liệu sản phẩm."],
    [
      "Bảo quản",
      careInstruction ??
        "Giặt tay hoặc giặt nhẹ, hạn chế vắt mạnh, ủi nhiệt độ thấp.",
    ],
  ];

  return (
    <section className="product-page-shell pb-10 pt-8">
      <h2 className="mb-5 text-center text-heading-section uppercase">
        Mô tả sản phẩm
      </h2>
      <div
        className="grid lg:grid-cols-[minmax(0,clamp(340px,28vw,420px))_minmax(0,1fr)] lg:items-center"
        style={{ gap: "var(--product-description-gap)" }}
      >
        <div>
          <h3 className="mb-3 text-heading-card">{product.name}</h3>
          <p className="mb-6 text-body-sm font-light leading-relaxed text-foreground/80">
            {product.description}
          </p>
          <div className="flex flex-col border-y border-[#d9d9d9]">
            {detailRows.map(([label, value]) => (
              <div
                key={label}
                className="grid border-b border-[#d9d9d9] py-3 last:border-b-0"
                style={{
                  gridTemplateColumns:
                    "minmax(var(--product-description-table-label), var(--product-description-table-label)) minmax(0,1fr)",
                }}
              >
                <span className="text-body-sm font-bold">{label}</span>
                <span className="text-body-sm font-light leading-relaxed text-foreground/75">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-body-lg font-bold">
            * Proudly Made In Vietnam
          </p>
        </div>

        <div className="grid overflow-hidden rounded-lg shadow-lg md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-[3/4]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] md:aspect-[3/4]">
            <Image
              src={product.images[Math.min(1, product.images.length - 1)]}
              alt={product.name}
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RecommendationSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="product-page-shell pb-10 pt-7">
      <h2 className="mb-6 text-center text-heading-section uppercase">
        Có thể bạn cũng thích
      </h2>
      <div
        className="grid sm:grid-cols-2 lg:grid-cols-4"
        style={{
          columnGap: "var(--product-grid-gap-x)",
          rowGap: "var(--product-grid-gap-y)",
        }}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            className="gap-[var(--product-card-gap)]"
          />
        ))}
      </div>
    </section>
  );
}
