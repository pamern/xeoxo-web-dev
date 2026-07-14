import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types/product.types";

type CollectionStoryCardProps = {
  collection: Collection & {
    displayName?: string;
    date?: string;
    image?: string;
    quote?: string;
    body?: string[];
  };
  imageFirst?: boolean;
};

export function CollectionStoryCard({
  collection,
  imageFirst = true,
}: CollectionStoryCardProps) {
  const title = collection.displayName ?? collection.name;
  const image = collection.image ?? collection.coverImage ?? "/images/products/placeholder.png";
  const date = collection.date;
  const quote = collection.quote;
  const body = collection.body && collection.body.length > 0 ? collection.body.slice(0, 2) : [];
  const href = ROUTES.COLLECTION(collection.slug);

  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full flex-col outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black/20 lg:h-[446px] lg:flex-row",
        !imageFirst && "lg:flex-row-reverse"
      )}
      aria-label={`Mở bộ sưu tập ${title}`}
    >
      <div className="relative block h-[300px] w-full overflow-hidden lg:h-full lg:w-1/2">
        <div className="relative h-full w-full lg:px-[10px] lg:py-[25px]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 864px"
            className={cn(
              "object-cover object-top transition-transform duration-500 group-hover:scale-[1.02] lg:!top-[25px] lg:!h-[396px] lg:!w-[calc(100%-110px)]",
              imageFirst ? "lg:!left-[100px]" : "lg:!left-[10px]"
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex w-full flex-col justify-between px-6 py-8 lg:h-full lg:w-1/2 lg:py-[25px]",
          imageFirst ? "lg:pl-[50px] lg:pr-[100px]" : "lg:pl-[100px] lg:pr-[50px]"
        )}
      >
        <div>
          <div className="mb-5 flex items-center gap-5">
            <h2 className="min-w-0 flex-1 truncate text-heading-section font-bold leading-none text-black transition-opacity group-hover:opacity-75">
              {title}
            </h2>
            <div className="h-px flex-1 bg-[#3b3b3b]" />
            <span
              aria-hidden
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black text-2xl leading-none text-black transition-all duration-300 group-hover:translate-x-1 group-hover:bg-black group-hover:text-white"
            >
              →
            </span>
          </div>

          {(date || quote) && (
            <div className="mb-6 flex items-center gap-5">
              {date && (
                <div className="flex h-[34px] w-[230px] shrink-0 items-center justify-center rounded-full border border-black text-lg font-normal leading-none text-black">
                  {date}
                </div>
              )}

              {quote && (
                <p className="text-left font-serif text-base font-light italic leading-tight text-black">
                  “{quote}”
                </p>
              )}
            </div>
          )}

          {body.length > 0 && (
            <div className="space-y-4 px-0 lg:px-5">
              {body.map((paragraph) => (
                <p key={paragraph} className="text-justify text-base font-light leading-relaxed text-black">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 h-[2px] w-full bg-[#3b3b3b] transition-opacity group-hover:opacity-70" />
      </div>
    </Link>
  );
}
