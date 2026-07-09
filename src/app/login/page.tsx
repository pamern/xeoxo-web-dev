import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthExperience } from "@/components/organisms/AuthExperience";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản XÉO XỌ để nhận vô số đặc quyền và quyền lợi mua sắm.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Suspense fallback={null}>
        <AuthExperience mode="login" className="max-w-[1068px]" pageFallback />
      </Suspense>
    </main>
  );
}
