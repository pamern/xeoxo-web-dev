import { Suspense } from "react";
import { ChatWidget } from "@/components/organisms/ChatWidget";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { getCategoriesByDepartment } from "@/features/homepage/homepage.service";

async function getHeaderCategoryMenus() {
  try {
    const [womenCategories, menCategories] = await Promise.all([
      getCategoriesByDepartment("WOMEN"),
      getCategoriesByDepartment("MEN"),
    ]);
    const aoDaiCategories = [...womenCategories, ...menCategories].filter(
      (category) =>
        category.categorySlug.includes("ao-dai") ||
        category.categoryName.toLowerCase().includes("áo dài"),
    );
    return { womenCategories, menCategories, aoDaiCategories };
  } catch {
    return { womenCategories: [], menCategories: [], aoDaiCategories: [] };
  }
}

// Khung dùng chung cho mọi trang public của website (header + footer).
export async function SiteLayout({
  children,
  fixedHeader: _fixedHeader,
}: {
  children: React.ReactNode;
  fixedHeader?: boolean;
}) {
  const { womenCategories, menCategories, aoDaiCategories } =
    await getHeaderCategoryMenus();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="site-layout-header">
        <Suspense
          fallback={<div className="min-h-[120px] w-full bg-background" />}
        >
          <SiteHeader
            womenCategories={womenCategories}
            menCategories={menCategories}
            aoDaiCategories={aoDaiCategories}
          />
        </Suspense>
      </div>

      <main className="flex-1">{children}</main>

      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>

      <ChatWidget />
    </div>
  );
}
