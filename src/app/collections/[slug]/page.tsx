import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LazyRender } from "@/components/atoms/LazyRender";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { CollectionHeroMedia } from "@/components/organisms/CollectionHeroMedia/CollectionHeroMedia";
import { CollectionProducts } from "@/components/organisms/CollectionProducts";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { ValueProposition } from "@/components/organisms/ValueProposition";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import { VALUE_PROPS } from "@/data/catalog";
import {
  buildCollectionDetailImages,
  fetchCollectionBySlugFromApi,
  getCollectionHeroVideo,
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
          <section className="breadcrumb-shell flex items-start bg-white">
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
              className="text-sm leading-none text-black"
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
  const heroVideo = getCollectionHeroVideo(collection.slug);

  return (
    <section className="relative isolate flex aspect-[1920/787] min-h-[320px] w-full items-center justify-center overflow-hidden bg-black text-white sm:min-h-[400px] lg:min-h-[520px]">
      <CollectionHeroMedia
        imageSrc={collection.coverImage}
        imageAlt={collection.name}
        videoSrc={heroVideo}
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex w-full max-w-[1427px] flex-col items-center justify-center px-6 py-10 text-center text-white sm:px-8 md:px-10 lg:px-12">
        {eyebrow ? (
          <p className="text-2xl font-bold uppercase leading-[1.1] [text-shadow:0px_4px_10px_rgba(0,0,0,0.65)] md:text-[2.375rem]">
            {eyebrow}
          </p>
        ) : null}
        {subtitle ? (
          <p className="mt-2 text-base font-bold uppercase leading-[1.1] [text-shadow:0px_4px_10px_rgba(0,0,0,0.65)] md:text-[1.125rem]">
            {subtitle}
          </p>
        ) : null}
        <h1 className="mt-2 text-4xl font-extrabold uppercase leading-none [text-shadow:0px_5px_14px_rgba(0,0,0,0.75)] md:text-[3.5rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-10 max-w-[1427px] text-center text-lg font-light leading-[1.55] [text-shadow:0px_3px_8px_rgba(0,0,0,0.65)] md:text-[1.25rem]">
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
      {heading && <h2 className="text-lg font-bold text-black md:text-[1.375rem]">{heading}</h2>}
      {body && <p className="text-justify text-lg font-light leading-relaxed text-black">{body}</p>}
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
          <Image src={displayImages[0]} alt="" fill sizes="754px" className="object-cover object-top" />
        </div>

        <div className="flex flex-col gap-[30px]">
          <div className="grid gap-[10px] md:grid-cols-2">
            <div className="relative h-[225px] overflow-hidden">
              <Image src={displayImages[1]} alt="" fill sizes="377px" className="object-cover object-top" />
            </div>
            <div className="relative h-[225px] overflow-hidden">
              <Image src={displayImages[2]} alt="" fill sizes="377px" className="object-cover object-top" />
            </div>
          </div>

          {(story?.heading || story?.body) && (
            <JsonTextBlock heading={story.heading} body={story.body} />
          )}
        </div>
      </div>

      <LazyRender fallback={<StoryGridSkeleton variant="editorial" />}>
        <div className="grid gap-[50px] xl:grid-cols-2">
          <div className="flex flex-col gap-[30px]">
            <div className="grid gap-[10px] md:grid-cols-2">
              <div className="relative h-[450px] overflow-hidden">
                <Image src={displayImages[3]} alt="" fill sizes="377px" className="object-cover object-top" />
              </div>
              <div className="relative h-[450px] overflow-hidden">
                <Image src={displayImages[4]} alt="" fill sizes="377px" className="object-cover object-top" />
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
            <Image src={displayImages[5]} alt="" fill sizes="754px" className="object-cover object-top" />
          </div>
        </div>
      </LazyRender>

      <LazyRender fallback={<StoryGridSkeleton variant="closing" />}>
        <div className="grid gap-[50px] xl:grid-cols-2">
          <div className="relative h-[904px] overflow-hidden">
            <Image src={displayImages[6]} alt="" fill sizes="759px" className="object-cover object-top" />
          </div>
          <div className="relative h-[902px] overflow-hidden">
            <Image src={displayImages[7]} alt="" fill sizes="757px" className="object-cover object-top" />
          </div>
        </div>
      </LazyRender>
    </section>
  );
}

function StoryGridSkeleton({
  variant,
}: {
  variant: "editorial" | "closing";
}) {
  if (variant === "closing") {
    return (
      <div className="grid gap-[50px] xl:grid-cols-2" aria-hidden>
        <div className="h-[904px] animate-pulse bg-secondary/40" />
        <div className="h-[902px] animate-pulse bg-secondary/40" />
      </div>
    );
  }

  return (
    <div className="grid gap-[50px] xl:grid-cols-2" aria-hidden>
      <div className="flex flex-col gap-[30px]">
        <div className="grid gap-[10px] md:grid-cols-2">
          <div className="h-[450px] animate-pulse bg-secondary/40" />
          <div className="h-[450px] animate-pulse bg-secondary/40" />
        </div>
        <div className="h-[220px] animate-pulse bg-secondary/30" />
      </div>
      <div className="h-[720px] animate-pulse bg-secondary/40 xl:h-[904px]" />
    </div>
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
