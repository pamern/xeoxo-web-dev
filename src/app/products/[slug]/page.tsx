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
  const images = product.media
    .filter((media) => media.media_type === "IMAGE")
    .map((media) => safeImageSrc(media.url));

  return {
    id: String(product.product_line_id),
    slug: product.slug,
    name: product.name,
    price: product.price,
    images: images.length ? images : ["/images/placeholder.png"],
    categorySlug: "api",
    gender: "nu",
    description: product.description ?? "",
    sizes: product.sizes.map((size) => size.size_name).filter(Boolean),
    colors: product.color
      ? [{ name: product.color.color_name, hex: product.color.color_code }]
      : [{ name: "Mặc định", hex: "#111111" }],
  };
}

function mergeProductDetailImageData(
  apiProduct: ProductDetailDto,
  fallbackProduct?: Product | null,
): Product {
  const apiMappedProduct = mapApiProduct(apiProduct);

  if (!fallbackProduct) {
    return apiMappedProduct;
  }

  return {
    ...fallbackProduct,
    id: apiMappedProduct.id,
    slug: apiMappedProduct.slug,
    name: apiMappedProduct.name,
    price: apiMappedProduct.price,
    salePrice: apiMappedProduct.salePrice,
    description: apiMappedProduct.description,
    images: apiMappedProduct.images,
    sizes: apiMappedProduct.sizes,
    colors: apiMappedProduct.colors,
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
    apiProduct ? mergeProductDetailImageData(apiProduct, result?.product) : null;

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

  const product = mergeProductDetailImageData(apiProduct, result?.product);
  const relatedProducts = result?.relatedProducts ?? [];
  const recommendedProducts = relatedProducts.slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-site px-6 pb-12 pt-5 xl:px-[100px]">
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
        apiProduct={apiProduct}
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
      className="h-[25px] w-full bg-cover bg-center"
      style={{ backgroundImage: "url(/images/strip-section-divider.png)" }}
    />
  );
}

function ProductDescription({
  product,
  apiProduct,
  collectionName,
  materialName,
  careInstruction,
}: {
  product: Product;
  apiProduct: ProductDetailDto;
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
    ["Kiểu dáng", apiProduct.design_style ?? "Thông tin kiểu dáng sẽ được cập nhật."],
    [
      "Phù hợp với",
      apiProduct.usage_context ?? "Thông tin phù hợp với sẽ được cập nhật.",
    ],
    ["Tính năng", apiProduct.features?.join(", ") || "Đang cập nhật"],
    [
      "Bảo quản",
      careInstruction ??
        "Giặt tay hoặc giặt nhẹ, hạn chế vắt mạnh, ủi nhiệt độ thấp.",
    ],
  ];

  return (
    <section
      id="product-description-section"
      className="mx-auto w-full max-w-site px-6 pb-10 pt-8 xl:px-[100px]"
    >
      <h2 className="mb-5 text-center text-heading-section font-bold uppercase">
        Mô tả sản phẩm
      </h2>
      <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
        <div>
          <h3 className="mb-3 text-2xl font-bold">{product.name}</h3>
          <p className="mb-6 text-body-sm font-light leading-relaxed text-foreground/80">
            {product.description}
          </p>
          <div className="flex flex-col border-y border-[#d9d9d9]">
            {detailRows.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[120px_minmax(0,1fr)] border-b border-[#d9d9d9] py-3 last:border-b-0"
              >
                <span className="text-body-sm font-bold">{label}</span>
                <span className="text-body-sm font-light leading-relaxed text-foreground/75">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-lg font-bold">
            * Proudly Made In Vietnam
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[20px] shadow-lg md:grid-cols-2">
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
    <section className="mx-auto w-full max-w-site px-6 pb-10 pt-7 xl:px-[100px]">
      <h2 className="mb-6 text-center text-heading-section font-bold uppercase">
        Có thể bạn cũng thích
      </h2>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
