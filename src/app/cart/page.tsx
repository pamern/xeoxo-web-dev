import { CartSummary } from "@/components/organisms/CartSummary";
import { CheckoutForm } from "@/components/organisms/CheckoutForm";
import { SiteLayout } from "@/components/templates/SiteLayout";

export default function CartPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid w-full max-w-[1728px] gap-10 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,720px)_minmax(0,920px)] lg:justify-center lg:gap-[40px] lg:px-[20px] lg:py-[50px]">
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
