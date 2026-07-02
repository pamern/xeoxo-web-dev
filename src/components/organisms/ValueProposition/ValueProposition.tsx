import Image from "next/image";

// "ĐỊNH VỊ GIÁ TRỊ" (Figma node 1:195): dải ảnh mỏng phía trên, bên dưới là
// 2 cột — ảnh (trái) và khối nội dung logo + tiêu đề + danh sách (phải).
export function ValueProposition({ values }: { values: string[] }) {
  return (
    <section className="relative">
      {/* Dải ảnh nền mỏng phía trên (~1/3) */}
      <div className="absolute inset-x-0 top-0 h-1/3 overflow-hidden">
        <Image
          src="/images/bg-dvgt.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="object-cover"
        />
      </div>

      <div className="relative mx-auto flex max-w-site flex-col items-center gap-10 px-6 py-16 lg:flex-row lg:justify-center xl:px-[100px]">
        {/* Cột ảnh */}
        <div className="relative h-[400px] w-full max-w-[788px] overflow-hidden rounded-md bg-secondary lg:h-[515px]">
          <Image
            src="/images/subtract.png"
            alt="Định vị giá trị Xéo Xọ"
            fill
            sizes="(max-width: 1024px) 100vw, 788px"
            className="object-cover"
          />
        </div>

        {/* Cột nội dung */}
        <div className="flex w-full max-w-[640px] flex-col gap-5 drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]">
          <Image
            src="/images/logovang.png"
            alt="XÉO XỌ"
            width={307}
            height={128}
            className="h-auto w-[240px] object-contain"
          />
          <h2 className="text-3xl font-semibold md:text-[44px]">ĐỊNH VỊ GIÁ TRỊ</h2>
          <ul className="flex flex-col gap-[15px] px-5">
            {values.map((value) => (
              <li key={value} className="text-xl font-light md:text-[28px]">
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
