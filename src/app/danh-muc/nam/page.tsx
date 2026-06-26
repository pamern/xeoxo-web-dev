import { CatalogPage, buildCatalogMetadata } from "@/components/templates/CatalogPage";

export const metadata = buildCatalogMetadata("nam");

export default function MenCatalogPage() {
  return <CatalogPage gender="nam" />;
}
