import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { CollectionStoryCard } from "@/components/molecules/CollectionStoryCard";
import { PublicPageHeader } from "@/components/molecules/PublicPageHeader/PublicPageHeader";
import { StarsBanner } from "@/components/organisms/StarsBanner";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";
import {
  fetchCollectionsFromApi,
  mapApiCollectionToCollection,
} from "@/data/collections.api";

export const metadata: Metadata = {
  title: "Bộ sưu tập",
  description: "Khám phá các bộ sưu tập của XÉO XỌ.",
};

export const dynamic = "force-dynamic";

function buildDisplayCollections(
  collections: ReturnType<typeof mapApiCollectionToCollection>[],
) {
  return collections.map((collection) => ({
    ...collection,
    displayName: collection.name,
  }));
}

export default async function CollectionsPage() {
  const apiCollections = await fetchCollectionsFromApi();
  const collections = [...apiCollections]
    .sort(compareCollectionsByNewest)
    .map((collection) => mapApiCollectionToCollection(collection));
  const displayCollections = buildDisplayCollections(collections);

  return (
    <SiteLayout>
      <main className="bg-white">
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
                { label: "Bộ sưu tập" },
              ]}
              className="text-sm leading-none text-black"
            />
          </section>

          <section className="pb-12 md:pb-20 xl:pb-[100px]">
            <PublicPageHeader
              eyebrow="Khám phá"
              title="BỘ SƯU TẬP"
              titleContainerClassName="max-w-[438px]"
              titleClassName="text-center uppercase"
              underlineClassName="mt-1 w-64 sm:w-80 md:w-[438px]"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <article className="relative h-[520px] overflow-hidden bg-black text-white md:h-[680px] lg:h-full lg:min-h-[975px]">
                <Image
                  src="/images/collection-bg1.png"
                  alt="Bộ sưu tập Xéo xọ"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />

                <div className="absolute inset-x-[6%] top-[39%] flex w-[88%] flex-col gap-3 font-serif text-white xl:gap-[10px]">
                  <p className="text-xl font-light leading-none">Xin chào,</p>

                  <h2 className="text-4xl font-light leading-tight xl:leading-[1.15]">
                    Chúng mình là{" "}
                    <span className="text-5xl font-bold italic leading-tight xl:leading-[1.15]">
                      Xéo xọ
                    </span>
                  </h2>

                  <p className="text-right text-xl font-light italic leading-snug md:text-2xl xl:text-[1.625rem] xl:leading-[1.2]">
                    ...một người kể chuyện bằng vải tơ, bằng những đường kim mũi chỉ.
                  </p>
                </div>
              </article>

              <div className="grid grid-cols-1 bg-white lg:grid-rows-[auto_262px_auto_262px_auto]">
                <IntroCopy
                  title="Hành trình của Xéo xọ bắt đầu từ những ngày còn rất nhỏ"
                  className="bg-white px-6 py-8 md:px-12 lg:px-10 lg:py-6 xl:px-[50px] xl:pr-[100px]"
                >
                  lớn lên cùng ký ức về mẹ, về bà, về những tà áo dài bay trong gió, và
                  những mùa hè ngập tràn nắng. Xéo xọ không chỉ làm quần áo, Xéo xọ lưu
                  giữ những khoảnh khắc.
                </IntroCopy>

                <IntroImage src="/images/collection-bg2.png" />

                <IntroCopy
                  title="Mỗi bộ sưu tập là một chuyến phiêu lưu"
                  className="bg-white px-6 py-8 text-left md:px-12 lg:px-10 lg:py-6 xl:px-[50px] xl:pr-[100px] xl:text-right"
                >
                  có khi là bước chậm trên phố cổ Hà Nội, có khi là lắng nghe nhịp sóng
                  vỗ ở làng chài Ninh Thuận, hay đơn giản chỉ là cảm giác nhẹ tênh khi
                  khoác lên mình một chiếc đầm lụa giữa trưa hè.
                </IntroCopy>

                <IntroImage src="/images/collection-bg3.png" />

                <IntroCopy
                  title="10 năm qua, Xéo xọ đã, đang kể những câu chuyện ấy,"
                  className="bg-white px-6 py-8 text-left md:px-12 lg:px-10 lg:py-6 xl:px-[50px] xl:pr-[100px] xl:text-left"
                  bodyClassName="text-xl md:text-2xl xl:text-[1.5625rem]"
                >
                  Và hành trình ấy của Xéo xọ chỉ mới bắt đầu...
                </IntroCopy>
              </div>
            </div>
          </section>

          <section className="flex w-full flex-col gap-6 xl:gap-[25px]">
            {displayCollections.length > 0 ? (
              displayCollections.map((collection, index) => (
                <CollectionStoryCard
                  key={`${collection.slug}-${index}`}
                  collection={collection}
                  imageFirst={index % 2 === 0}
                />
              ))
            ) : (
              <p className="px-6 py-20 text-center text-lg text-black xl:px-[100px]">
                Chưa có bộ sưu tập.
              </p>
            )}
          </section>

          <StarsBanner />
        </div>
      </main>
    </SiteLayout>
  );
}

function compareCollectionsByNewest(
  a: Awaited<ReturnType<typeof fetchCollectionsFromApi>>[number],
  b: Awaited<ReturnType<typeof fetchCollectionsFromApi>>[number],
) {
  return getCollectionTime(b) - getCollectionTime(a);
}

function getCollectionTime(
  collection: Awaited<ReturnType<typeof fetchCollectionsFromApi>>[number],
) {
  const value = collection.launchDate ?? collection.createdAt ?? "";
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function IntroCopy({
  title,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <article className={`flex flex-col justify-center gap-4 xl:gap-[15px] ${className ?? ""}`}>
      <h2 className="text-lg font-bold text-black">{title}</h2>

      <p className={`font-serif text-lg font-normal italic text-black ${bodyClassName ?? ""}`}>
        {children}
      </p>
    </article>
  );
}

function IntroImage({ src }: { src: string }) {
  return (
    <div className="relative h-56 overflow-hidden bg-secondary md:h-[262px] lg:h-full">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
