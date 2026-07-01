import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/templates/AuthShell";
import { RegisterForm } from "@/components/organisms/RegisterForm";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản XÉO XỌ để nhận ưu đãi độc quyền, quà tặng giới hạn và sự kiện đặc biệt.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      footer={
        <>
          <Link href={ROUTES.LOGIN}>Đăng nhập ngay</Link>
          <Link href={ROUTES.HOME}>Quên mật khẩu</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
