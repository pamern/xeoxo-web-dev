import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  iconSrc?: string;
  iconAlt?: string;
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm font-light text-muted-foreground", className)}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {item.href && !current ? (
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  <BreadcrumbContent item={item} />
                </Link>
              ) : (
                <span className={current ? "text-foreground" : undefined}>
                  <BreadcrumbContent item={item} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function BreadcrumbContent({ item }: { item: BreadcrumbItem }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {item.iconSrc && (
        <Image
          src={item.iconSrc}
          alt={item.iconAlt ?? ""}
          width={13}
          height={13}
          aria-hidden={!item.iconAlt}
        />
      )}
      {item.label && <span>{item.label}</span>}
    </span>
  );
}
