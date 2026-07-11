import Image from "next/image";

export function ValueProposition({ values }: { values: string[] }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[32%] min-h-[160px] overflow-hidden">
        <Image
          src="/images/bg-dvgt.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="catalog-shell relative z-10 flex flex-col items-center gap-8 py-12 lg:flex-row lg:justify-center lg:gap-10 lg:py-16">
        <div className="relative h-[320px] w-full max-w-[640px] overflow-hidden rounded-md bg-secondary md:h-[380px] xl:h-[440px]">
          <Image
            src="/images/subtract.png"
            alt="Định vị giá trị Xéo Xọ"
            fill
            sizes="(max-width: 1024px) 100vw, 788px"
            className="object-cover"
          />
        </div>

        <div className="flex w-full max-w-[520px] flex-col gap-4 drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)] md:gap-4.5">
          <Image
            src="/images/logovang.png"
            alt="XÉO XỌ"
            width={307}
            height={128}
            className="h-auto w-44 object-contain md:w-48 xl:w-52"
          />

          <h2 className="text-2xl font-semibold uppercase leading-none text-black md:text-3xl xl:text-4xl">
            Định vị giá trị
          </h2>

          <ul className="flex flex-col gap-3 px-4 md:gap-3.5 md:px-5 xl:gap-4 xl:px-5">
            {values.map((value) => (
              <li
                key={value}
                className="text-base font-light leading-relaxed text-black md:text-lg xl:text-xl"
              >
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
