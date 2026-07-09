import { CartSummary } from "@/components/organisms/CartSummary";
import { CheckoutForm } from "@/components/organisms/CheckoutForm";
import { SiteLayout } from "@/components/templates/SiteLayout";

export default function CartPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid w-full max-w-site gap-10 px-5 py-10 md:px-10 lg:grid-cols-[minmax(0,754px)_minmax(0,714px)] lg:justify-center lg:gap-[60px] lg:px-gutter lg:py-section">
        <div className="order-2 lg:order-1">
          <CheckoutForm />
        </div>
        <div className="order-1 lg:order-2">
          <CartSummary />
        </div>
      </section>
    </SiteLayout>
  );
}
