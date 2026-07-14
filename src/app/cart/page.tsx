import {
  CartItemsSection,
  CartSummaryProvider,
  PaymentSummarySection,
} from "@/components/organisms/CartSummary";
import { CheckoutForm } from "@/components/organisms/CheckoutForm";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { CheckoutProvider } from "@/hooks/useCheckout";

export default function CartPage() {
  return (
    <SiteLayout>
      <CheckoutProvider>
        <CartSummaryProvider>
          <section className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.28fr)] lg:justify-center lg:gap-[30px] lg:px-[60px] lg:py-[40px] xl:gap-[40px] xl:px-[100px]">
            <div className="order-1 w-full max-w-[640px] lg:order-2">
              <CartItemsSection />
            </div>
            <div className="order-2 w-full max-w-[520px] lg:order-1 lg:row-span-2 lg:self-start lg:justify-self-end">
              <CheckoutForm />
            </div>
            <div className="order-3 w-full max-w-[640px] lg:col-start-2 lg:self-start">
              <PaymentSummarySection />
            </div>
          </section>
        </CartSummaryProvider>
      </CheckoutProvider>
    </SiteLayout>
  );
}
