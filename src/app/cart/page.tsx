import {
  CartSummaryPayment,
  CartSummaryProducts,
  CartSummaryProvider,
} from "@/components/organisms/CartSummary";
import { CheckoutForm } from "@/components/organisms/CheckoutForm";
import { SiteLayout } from "@/components/templates/SiteLayout";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <SiteLayout>
      <CartSummaryProvider>
        <section className="mx-auto grid w-full max-w-[1728px] gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,754px)_minmax(0,714px)] lg:grid-rows-[auto_auto] lg:justify-center lg:gap-x-12 lg:gap-y-10 lg:px-20 lg:py-10">
          <div className="order-1 min-w-0 lg:col-start-2 lg:row-start-1">
            <CartSummaryProducts />
          </div>
          <div className="order-2 min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <CheckoutForm />
          </div>
          <div className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
            <CartSummaryPayment />
          </div>
        </section>
      </CartSummaryProvider>
    </SiteLayout>
  );
}
