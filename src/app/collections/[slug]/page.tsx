import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { CollectionProducts } from "@/components/organisms/CollectionProducts";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { ValueProposition } from "@/components/organisms/ValueProposition";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { VALUE_PROPS } from "@/data/catalog";
import {
  buildCollectionDetailImages,
  fetchCollectionBySlugFromApi,
  mapApiCollectionToCollection,
  mapApiProductLinesToProducts,
  type ApiProductLine,
  type CollectionContent,
} from "@/data/collections.api";
import type { Collection } from "@/types/product.types";

type Params = { slug: string };

export const dynamic = "force-dynamic";

const STORY_IMAGE_FALLBACK = "/images/placeholder.png";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const apiCollection = await fetchCollectionBySlugFromApi(slug);
  if (!apiCollection) return { title: "Không tìm thấy bộ sưu tập" };
  const collection = mapApiCollectionToCollection(apiCollection);
  if (!collection) return { title: "Không tìm thấy bộ sưu tập" };

  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const apiCollection = await fetchCollectionBySlugFromApi(slug);
  if (!apiCollection) notFound();

  const collection = mapApiCollectionToCollection(apiCollection);
  const apiProducts = mapApiProductLinesToProducts(apiCollection?.productLines);
  const products = apiProducts;
  const storyImages = buildCollectionDetailImages(apiCollection?.productLines, 8);

  return (
    <SiteLayout>
      <div className="bg-white">
        <div className="mx-auto w-full max-w-site">
          <section className="flex h-20 items-start bg-white px-6 pb-5 pt-12 xl:h-[86px] xl:pl-[100px] xl:pr-[50px] xl:pt-[50px]">
            <Breadcrumbs
              items={[
                {
                  label: "",
                  href: ROUTES.HOME,
                  iconSrc: "/icons/home.svg",
                  iconAlt: "Trang chủ",
                },
                { label: "Bộ sưu tập", href: ROUTES.COLLECTIONS },
                { label: collection.name },
              ]}
              className="text-body-sm leading-none text-black"
            />
          </section>

          <CollectionHero collection={collection} content={apiCollection?.content} />
          <JsonSections sections={apiCollection?.content?.sections} />
          <ImageStoryGrid
            images={storyImages}
            story={apiCollection?.content?.story}
            editorialItems={apiCollection?.content?.editorial_opening}
          />
          <CollectionProducts
            products={products}
            collectionName={collection.name}
            collectionSlug={collection.slug}
          />
          <ValueProposition values={VALUE_PROPS} />

          <div>
            <StarsBanner />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function CollectionHero({
  collection,
  content,
}: {
  collection: Collection;
  content?: CollectionContent | null;
}) {
  const hero = content?.hero;
  const eyebrow = hero?.eyebrow;
  const subtitle = hero?.subtitle;
  const title = hero?.title ?? collection.name;
  const description = hero?.description ?? collection.description;

  return (
    <section className="relative flex h-[620px] items-center justify-center overflow-hidden bg-black text-white md:h-[975px]">
      <Image
        src={collection.coverImage}
        alt={collection.name}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 1728px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex w-full max-w-[1427px] translate-y-12 flex-col items-center px-6 text-center text-white md:translate-y-[115px]">
        {eyebrow ? (
          <p className="text-heading-section font-bold uppercase leading-[1.1] [text-shadow:0px_4px_10px_rgba(0,0,0,0.65)] md:text-[38px]">
            {eyebrow}
          </p>
        ) : null}
        {subtitle ? (
          <p className="mt-2 text-button font-bold uppercase leading-[1.1] [text-shadow:0px_4px_10px_rgba(0,0,0,0.65)] md:text-[18px]">
            {subtitle}
          </p>
        ) : null}
        <h1 className="mt-2 text-display-section font-extrabold uppercase leading-none [text-shadow:0px_5px_14px_rgba(0,0,0,0.75)] md:text-[56px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-10 max-w-[1427px] text-center text-body-lg font-light leading-[1.55] [text-shadow:0px_3px_8px_rgba(0,0,0,0.65)] md:text-[20px]">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function JsonSections({ sections }: { sections?: CollectionContent["sections"] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="mx-auto flex w-full max-w-site flex-col gap-8 px-6 py-16 xl:px-[100px]">
      {sections.map((section, index) => (
        <JsonTextBlock
          key={`${section.heading}-${index}`}
          heading={section.heading}
          body={section.body}
        />
      ))}
    </section>
  );
}

function JsonTextBlock({
  heading,
  body,
}: {
  heading?: string;
  body?: string;
}) {
  return (
    <article className="mx-auto flex w-full max-w-[1479px] flex-col gap-3 text-black">
      {heading && (
        <h2 className="content-heading">
          {heading}
        </h2>
      )}
      {body && (
        <p className="content-body text-justify">
          {body}
        </p>
      )}
    </article>
  );
}

function ImageStoryGrid({
  images,
  story,
  editorialItems,
}: {
  images: string[];
  story?: CollectionContent["story"];
  editorialItems?: CollectionContent["editorial_opening"];
}) {
  const displayImages = resolveStoryImages(images);

  return (
    <section className="mx-auto flex w-full max-w-site flex-col gap-[50px] px-6 pb-[50px] xl:px-[100px]">
      <div className="grid gap-[50px] xl:grid-cols-2">
        <div className="relative h-[450px] overflow-hidden">
          <Image src={displayImages[0]} alt="" fill sizes="754px" className="object-cover" />
        </div>

        <div className="flex flex-col gap-[30px]">
          <div className="grid gap-[10px] md:grid-cols-2">
            <div className="relative h-[225px] overflow-hidden">
              <Image src={displayImages[1]} alt="" fill sizes="377px" className="object-cover" />
            </div>
            <div className="relative h-[225px] overflow-hidden">
              <Image src={displayImages[2]} alt="" fill sizes="377px" className="object-cover" />
            </div>
          </div>

          {(story?.heading || story?.body) && (
            <JsonTextBlock heading={story.heading} body={story.body} />
          )}
        </div>
      </div>

      <div className="grid gap-[50px] xl:grid-cols-2">
        <div className="flex flex-col gap-[30px]">
          <div className="grid gap-[10px] md:grid-cols-2">
            <div className="relative h-[450px] overflow-hidden">
              <Image src={displayImages[3]} alt="" fill sizes="377px" className="object-cover" />
            </div>
            <div className="relative h-[450px] overflow-hidden">
              <Image src={displayImages[4]} alt="" fill sizes="377px" className="object-cover" />
            </div>
          </div>

          {editorialItems && editorialItems.length > 0 ? (
            <div className="flex flex-col gap-5">
              {editorialItems.map((item, index) => (
                <JsonTextBlock
                  key={`${item.heading}-${index}`}
                  heading={item.heading}
                  body={item.body}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative h-[720px] overflow-hidden xl:h-[904px]">
          <Image src={displayImages[5]} alt="" fill sizes="754px" className="object-cover" />
        </div>
      </div>

      <div className="grid gap-[50px] xl:grid-cols-2">
        <div className="relative h-[904px] overflow-hidden">
          <Image src={displayImages[6]} alt="" fill sizes="759px" className="object-cover" />
        </div>
        <div className="relative h-[902px] overflow-hidden">
          <Image src={displayImages[7]} alt="" fill sizes="757px" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

function resolveStoryImages(images: string[]) {
  if (images.length === 0) {
    return Array.from({ length: 8 }, () => STORY_IMAGE_FALLBACK);
  }

  const filledImages = [...images];
  let index = 0;

  while (filledImages.length < 8) {
    filledImages.push(images[index % images.length]);
    index += 1;
  }

  return filledImages.slice(0, 8);
}
