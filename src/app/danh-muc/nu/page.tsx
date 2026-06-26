import { CatalogPage, buildCatalogMetadata } from "@/components/templates/CatalogPage";

export const metadata = buildCatalogMetadata("nu");

export default function WomenCatalogPage() {
  return <CatalogPage gender="nu" />;
}
