"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type AuthMode = "login" | "register";

export function AuthModalLink({
  mode,
  children,
  className,
}: {
  mode: AuthMode;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());
  params.set("auth", mode);

  const href = `${pathname}?${params.toString()}`;

  return (
    <Link href={href} scroll={false} className={className}>
      {children}
    </Link>
  );
}
