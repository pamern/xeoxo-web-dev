import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { FilterChipButton } from "@/components/atoms/FilterChipButton";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { ProductCard } from "@/components/molecules/ProductCard";
import { ProductDetail } from "@/components/organisms/ProductDetail";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { PRODUCTS } from "@/data/catalog";
import { getProductBySlug, getRelatedProducts } from "@/data/queries";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product.types";

type Params = { slug: string };

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Khong tim thay san pham" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
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
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </div>
      <StripDivider />
      <ProductDescription product={product} />
      <RecommendationSection products={recommendedProducts} />
      <StripDivider />
      <ReviewsSection product={product} />
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

function ReviewsSection({ product }: { product: Product }) {
  const filters = [
    "Tất cả bình luận",
    "5 Sao (12)",
    "4 Sao (3)",
    "3 Sao (3)",
    "2 Sao (1)",
    "1 Sao (0)",
    "Có Bình luận (10)",
    "Có Hình ảnh / Video (2)",
  ];

  return (
    <section className="mx-auto w-full max-w-site px-6 py-10 xl:px-[100px]">
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div>
          <h2 className="text-[30px] font-bold uppercase">Đánh giá sản phẩm</h2>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-[44px] font-bold leading-none">4.5</span>
            <span className="pb-1 text-xl">trên 5</span>
            <span className="pb-1 text-2xl">★★★★◐</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <FilterChipButton key={filter} active={filter === filters[0]}>
              {filter}
            </FilterChipButton>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1387px] flex-col gap-5">
        {[1, 2, 3].map((item) => (
          <ReviewCard key={item} product={product} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button type="button" variant="primaryPill" size="pill">
          Xem thêm →
        </Button>
        <p className="mt-4 text-base font-light text-foreground/70">Hiển thị 3 trên tổng số 12 bình luận</p>
      </div>
    </section>
  );
}

function ReviewCard({ product }: { product: Product }) {
  return (
    <article className="rounded-[20px] bg-[#f3f3f3] px-8 py-7">
      <div className="flex gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-secondary">
          <Image src={product.images[0]} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">Lê Phước Thịnh</h3>
          <p className="text-sm">★★★★★</p>
          <p className="mt-1 text-xs font-light text-foreground/70">
            2022-09-16 11:48 | Phân loại hàng: Tây-Bắc
          </p>
          <p className="mt-2 text-sm">
            Chất lượng sản phẩm: <strong>Sản phẩm tốt</strong>
          </p>
          <p className="mt-3 text-sm font-light leading-relaxed">
            Đã mua lần thứ 2 và chất lượng vẫn quá ok. Sẽ còn ủng hộ nhiều.
            Mẫu mới rất đẹp, shop chuẩn bị chỉn chu và còn tặng quà rất dễ thương.
          </p>
          <div className="mt-4 flex gap-3">
            {product.images.slice(0, 3).map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-[72px] w-[72px] overflow-hidden bg-secondary">
                <Image src={image} alt="" fill sizes="72px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span>👍</span>
            <span>12</span>
          </div>
        </div>
      </div>
    </article>
  );
}
