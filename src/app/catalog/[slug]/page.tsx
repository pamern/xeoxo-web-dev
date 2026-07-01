import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CatalogPage,
  CATALOG_SLUGS,
  buildCatalogMetadata,
  type CatalogSlug,
} from "@/components/templates/CatalogPage";

type Params = { slug: string };

function isCatalogSlug(slug: string): slug is CatalogSlug {
  return CATALOG_SLUGS.includes(slug as CatalogSlug);
}

export function generateStaticParams() {
  return CATALOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCatalogSlug(slug)) return { title: "Không tìm thấy catalog" };
  return buildCatalogMetadata(slug);
}

export default async function CatalogRoutePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (!isCatalogSlug(slug)) notFound();

  return <CatalogPage slug={slug} />;
}
