import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

// Thẻ bộ sưu tập: ảnh nền + tên, dùng ở trang chủ, trang BST và filter catalog.
export function CollectionCard({
  collection,
  className,
  revealOnHover = false,
}: {
  collection: Collection;
  className?: string;
  revealOnHover?: boolean;
}) {
  return (
    <Link
      href={ROUTES.COLLECTION(collection.slug)}
      className={cn(
        "group relative block aspect-[16/9]",
        revealOnHover &&
          "z-0 transition-transform duration-500 ease-out hover:z-20 hover:scale-105 hover:shadow-xl",
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md">
        <Image
          src={collection.coverImage}
          alt={collection.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className={cn(
            "object-cover object-top transition duration-500",
            revealOnHover
              ? "blur-sm brightness-75 group-hover:blur-0 group-hover:brightness-100"
              : "group-hover:scale-105"
          )}
        />
        <span
          className={cn(
            "absolute inset-0 flex items-end px-5 pb-5 text-lg font-bold text-white transition duration-300",
            revealOnHover
              ? "bg-black/10 opacity-0 group-hover:bg-black/20 group-hover:opacity-100"
              : "items-center justify-center bg-black/25 font-medium opacity-100"
          )}
          style={{ color: "#fff", textShadow: "0 3px 12px rgba(0,0,0,0.75)" }}
        >
          {collection.name}
        </span>
      </div>
    </Link>
  );
}
