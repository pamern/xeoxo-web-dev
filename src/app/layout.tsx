import type { Metadata } from "next";
import { AppQueryProvider } from "@/components/providers/AppQueryProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { Crimson_Pro, Unbounded } from "next/font/google";
import { CartDrawerProvider } from "@/components/providers/CartDrawerProvider";
import { CartToastProvider } from "@/components/providers/CartToastProvider";
import "./globals.css";
import "./public.css";

const unbounded = Unbounded({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
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
    <html
      lang="vi"
      className={`${unbounded.variable} ${crimson.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                      mutation.target.removeAttribute('bis_skin_checked');
                    }
                    if (mutation.addedNodes) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                          if (node.hasAttribute('bis_skin_checked')) {
                            node.removeAttribute('bis_skin_checked');
                          }
                          node.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                            el.removeAttribute('bis_skin_checked');
                          });
                        }
                      });
                    }
                  });
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              })();
            `
          }}
        />
        <AppQueryProvider>
          <CartProvider>
            <CartDrawerProvider>
              <CartToastProvider>{children}</CartToastProvider>
            </CartDrawerProvider>
          </CartProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
