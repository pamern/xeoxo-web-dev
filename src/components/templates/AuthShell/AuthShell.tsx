import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

// Khung 2 cột cho trang đăng nhập/đăng ký: ảnh thương hiệu + nội dung form.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src="/auth/bg.png" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/30" aria-hidden />
        <Link
          href={ROUTES.HOME}
          className="text-shadow absolute left-10 top-10 text-3xl font-extrabold text-white"
        >
          XÉO XỌ
        </Link>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link href={ROUTES.HOME} className="mb-8 block text-2xl font-extrabold lg:hidden">
            XÉO XỌ
          </Link>
          <h1 className="text-3xl font-medium">{title}</h1>
          <p className="mt-2 text-base font-light text-foreground/70">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </main>
  );
}
