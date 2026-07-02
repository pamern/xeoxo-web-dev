import type { Metadata } from "next";
import { CollectionCard } from "@/components/molecules/CollectionCard";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { COLLECTIONS } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Bộ sưu tập",
  description: "Khám phá các bộ sưu tập của XÉO XỌ.",
};

export default function CollectionsPage() {
  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-site px-6 py-14 xl:px-[100px]">
        <div className="mb-10">
          <p className="text-base font-light uppercase text-muted-foreground">Catalog</p>
          <h1 className="text-4xl font-extrabold uppercase md:text-6xl">
            Bộ sưu tập
          </h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {COLLECTIONS.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </section>
      <StarsBanner />
    </SiteLayout>
  );
}
