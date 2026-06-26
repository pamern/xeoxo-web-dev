import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "XÉO XỌ — Lưu giữ vẻ đẹp Á Đông trong từng thiết kế",
    template: "%s | XÉO XỌ",
  },
  description:
    "XÉO XỌ — thương hiệu thời trang lưu giữ vẻ đẹp Á Đông trong từng thiết kế. Khám phá bộ sưu tập áo dài, đầm, váy và đồ nam nữ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={unbounded.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
