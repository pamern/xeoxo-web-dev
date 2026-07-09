import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { CollectionStoryCard } from "@/components/molecules/CollectionStoryCard";
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
              className="text-body-sm leading-none text-black"
            />
          </section>

          <section className="pb-12 md:pb-20 xl:pb-[100px]">
            <div className="flex min-h-32 flex-col items-center justify-start px-4 py-6 md:h-36 md:px-0 xl:h-[146px] xl:pb-[25px] xl:pt-[25px]">
              <div className="relative flex w-full max-w-[376px] flex-col items-center">
                <p className="eyebrow-text mb-0 self-center sm:text-body-lg md:text-eyebrow xl:text-eyebrow">
                  Khám phá
                </p>

                <h1 className="page-heading whitespace-nowrap text-center">
                  BỘ SƯU TẬP
                </h1>
              </div>

              <div
                className="mt-1 h-[5px] w-64 bg-[length:100%_100%] bg-center bg-no-repeat sm:w-80 md:w-[438px] xl:mt-[5px]"
                style={{ backgroundImage: "url(/images/strip-title-underline.png)" }}
                aria-hidden
              />
            </div>

            <div className="flex flex-col lg:h-[975px] lg:flex-row">
              <article className="relative h-[520px] overflow-hidden bg-black text-white md:h-[680px] lg:h-[975px] lg:w-1/2">
                <Image
                  src="/images/collection-bg1.png"
                  alt="Bộ sưu tập Xéo Xọ"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 864px"
                  className="object-cover"
                />

                <div className="absolute left-6 right-6 top-56 flex flex-col gap-3 font-serif text-white md:left-12 md:right-12 md:top-72 xl:left-[50px] xl:right-[50px] xl:top-[380px] xl:gap-[10px]">
                  <p className="text-body-lg md:text-eyebrow xl:text-eyebrow">
                    Xin chào,
                  </p>

                  <h2 className="text-heading-section md:text-display-section xl:text-heading-section xl:leading-[1.15]">
                    Chúng mình là{" "}
                    <span className="text-display-section italic md:text-display-page xl:text-display-page xl:leading-[1.15]">
                      Xéo xọ
                    </span>
                  </h2>

                  <p className="text-right text-body-xl italic md:text-quote-lg xl:text-quote-lg xl:leading-[1.2]">
                    ...một người kể chuyện bằng vải tơ, bằng những đường kim mũi chỉ.
                  </p>
                </div>
              </article>

              <div className="flex flex-col bg-white lg:h-[977px] lg:w-1/2">
                <div className="flex w-full flex-col">
                  <IntroCopy
                    title="Hành trình của Xéo xọ bắt đầu từ những ngày còn rất nhỏ"
                    className="min-h-40 px-6 py-8 md:px-12 xl:h-[160px] xl:px-[50px] xl:py-0 xl:pr-[100px]"
                  >
                    lớn lên cùng ký ức về mẹ, về bà, về những tà áo dài bay trong gió, và
                    những mùa hè ngập tràn nắng. Xéo xọ không chỉ làm quần áo, Xéo xọ lưu
                    giữ những khoảnh khắc.
                  </IntroCopy>

                  <IntroImage src="/images/collection-bg2.png" />

                  <IntroCopy
                    title="Mỗi bộ sưu tập là một chuyến phiêu lưu"
                    className="min-h-40 px-6 py-8 text-left md:px-12 xl:h-[164px] xl:px-[50px] xl:py-0 xl:pr-[100px] xl:text-right"
                  >
                    có khi là bước chậm trên phố cổ Hà Nội, có khi là lắng nghe nhịp sóng
                    vỗ ở làng chài Ninh Thuận, hay đơn giản chỉ là cảm giác nhẹ tênh khi
                    khoác lên mình một chiếc đầm lụa giữa trưa hè.
                  </IntroCopy>

                  <IntroImage src="/images/collection-bg3.png" />

                  <IntroCopy
                    title="10 năm qua, Xéo xọ đã, đang kể những câu chuyện ấy,"
                    className="min-h-32 px-6 py-8 text-left md:px-12 xl:h-[129px] xl:px-[50px] xl:py-0 xl:pr-[100px] xl:text-left"
                    bodyClassName="text-body-xl md:text-quote-lg xl:text-body-xl"
                  >
                    Và hành trình ấy của Xéo xọ chỉ mới bắt đầu...
                  </IntroCopy>
                </div>
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
              <p className="px-6 py-20 text-center text-body-lg text-black xl:px-gutter">
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
    <article className={`flex flex-col justify-center gap-4 overflow-hidden xl:gap-[15px] ${className ?? ""}`}>
      <h2 className="content-heading">
        {title}
      </h2>

      <p
        className={`eyebrow-text md:text-body-lg xl:text-body-lg ${
          bodyClassName ?? ""
        }`}
      >
        {children}
      </p>
    </article>
  );
}

function IntroImage({ src }: { src: string }) {
  return (
    <div className="relative h-56 overflow-hidden bg-secondary md:h-[262px]">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 864px"
        className="object-cover"
      />
    </div>
  );
}
