import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthExperience } from "@/components/organisms/AuthExperience";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản XÉO XỌ để nhận ưu đãi độc quyền, quà tặng giới hạn và sự kiện đặc biệt.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Suspense fallback={null}>
        <AuthExperience mode="register" className="max-w-[1068px]" pageFallback />
      </Suspense>
    </main>
  );
}
