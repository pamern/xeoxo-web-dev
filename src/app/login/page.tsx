import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/templates/AuthShell";
import { LoginForm } from "@/components/organisms/LoginForm";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản XÉO XỌ để nhận vô số đặc quyền và quyền lợi mua sắm.",
};

export default function LoginPage() {
  return (
    <AuthShell
      footer={
        <>
          <Link href={ROUTES.REGISTER}>Đăng ký tài khoản</Link>
          <Link href={ROUTES.HOME}>Quên mật khẩu</Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
