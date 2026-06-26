import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { collectionRoute } from "@/constants/routes";
import type { Collection } from "@/types/product.types";

// Thẻ bộ sưu tập: ảnh nền + tên, dùng ở trang chủ, trang BST và filter catalog.
export function CollectionCard({
  collection,
  className,
}: {
  collection: Collection;
  className?: string;
}) {
  return (
    <Link
      href={collectionRoute(collection.slug)}
      className={cn(
        "group relative block aspect-[16/9] overflow-hidden rounded-md",
        className
      )}
    >
      <Image
        src={collection.coverImage}
        alt={collection.name}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-lg font-medium text-white text-shadow">
        {collection.name}
      </span>
    </Link>
  );
}
