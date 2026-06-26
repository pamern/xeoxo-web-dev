import { CategoryBanner } from "@/components/molecules/CategoryBanner";
import { CollectionCard } from "@/components/molecules/CollectionCard";
import { GenderSelect } from "@/components/organisms/GenderSelect";
import { HeroCarousel } from "@/components/organisms/HeroCarousel";
import { ProductRow } from "@/components/organisms/ProductRow";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { categoryRoute } from "@/constants/routes";
import { COLLECTIONS } from "@/data/catalog";
import { getProductsByCategory } from "@/data/queries";

// Cấu hình các khối danh mục trên trang chủ — banner + hàng sản phẩm.
const HOME_SECTIONS = [
  {
    title: "ÁO ĐẦM - VÁY",
    categorySlug: "ao-dam-vay",
    gender: "nu" as const,
    image: "/banners/cat-dam-vay.png",
    productTitle: "SẢN PHẨM ÁO ĐẦM - VÁY",
  },
  {
    title: "ÁO DÀI",
    categorySlug: "ao-dai-nu",
    gender: "nu" as const,
    image: "/banners/cat-ao-dai.png",
    productTitle: "SẢN PHẨM ÁO DÀI",
  },
  {
    title: "ÁO DÀI ĐÔI - CƯỚI",
    categorySlug: "ao-cuoi",
    gender: "nu" as const,
    image: "/banners/cat-ao-cuoi.png",
    productTitle: "SẢN PHẨM ÁO DÀI ĐÔI - CƯỚI",
  },
];

export default function HomePage() {
  return (
    <SiteLayout>
      <HeroCarousel slides={COLLECTIONS} />

      {/* Dải bộ sưu tập nổi bật */}
      <section className="no-scrollbar mx-auto flex w-full max-w-site gap-5 overflow-x-auto px-6 py-8 xl:px-[100px]">
        {COLLECTIONS.map((collection) => (
          <CollectionCard
            key={collection.slug}
            collection={collection}
            className="w-[280px] shrink-0"
          />
        ))}
      </section>

      <GenderSelect />

      {HOME_SECTIONS.map((section) => (
        <div key={section.categorySlug}>
          <CategoryBanner
            title={section.title}
            image={section.image}
            href={categoryRoute(section.gender, section.categorySlug)}
          />
          <ProductRow
            title={section.productTitle}
            products={getProductsByCategory(section.categorySlug)}
            actionHref={categoryRoute(section.gender, section.categorySlug)}
          />
        </div>
      ))}

      <StarsBanner />
    </SiteLayout>
  );
}
