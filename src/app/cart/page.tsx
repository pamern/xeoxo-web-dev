import { CartSummary } from "@/components/organisms/CartSummary";
import { CheckoutForm } from "@/components/organisms/CheckoutForm";
import { SiteLayout } from "@/components/templates/SiteLayout";

export default function CartPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.28fr)] lg:justify-center lg:gap-[30px] lg:px-[60px] lg:py-[40px] xl:gap-[40px] xl:px-[100px]">
        <div className="order-2 lg:order-1 w-full max-w-[520px] justify-self-end">
          <CheckoutForm />
        </div>
        <div className="order-1 lg:order-2 w-full max-w-[640px]">
          <CartSummary />
        </div>
      </section>
    </SiteLayout>
  );
}
