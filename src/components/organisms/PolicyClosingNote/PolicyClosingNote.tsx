import Image from "next/image";

export function PolicyClosingNote() {
  return (
    <section className="site-container py-12 md:py-14">
      <div className="w-full max-w-narrow">
        <Image
          src="/images/strip-title-underline.png"
          alt=""
          width={438}
          height={5}
          className="h-[5px] w-full"
          aria-hidden
        />
      </div>

      <div className="py-5 text-foreground">
        <h2 className="max-w-[1119px] text-heading-section font-bold text-black md:text-display-section">
          XÉO XỌ <span className="font-light">luôn lắng nghe bạn</span>
        </h2>
        <p className="eyebrow-text mt-3 max-w-[1149px]">
          Chúng tôi luôn trân trọng và mong đợi nhận được mọi ý kiến đóng góp từ
          khách hàng
          <br className="hidden md:block" />
          &nbsp;để có thể nâng cấp trải nghiệm dịch vụ và sản phẩm tốt hơn nữa.
        </p>
      </div>

      <div className="w-full max-w-narrow">
        <Image
          src="/images/strip-title-underline.png"
          alt=""
          width={438}
          height={5}
          className="h-[5px] w-full"
          aria-hidden
        />
      </div>
    </section>
  );
}
