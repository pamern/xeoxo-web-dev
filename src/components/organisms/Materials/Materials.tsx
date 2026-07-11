import Image from "next/image";
import type { Material } from "@/types/product.types";

export function Materials({ materials }: { materials: Material[] }) {
  return (
    <section className="mx-auto flex w-full max-w-site flex-col gap-7 px-5 py-10 md:px-8 md:gap-9 xl:px-10 2xl:px-20">
      <h2 className="text-3xl font-medium leading-tight">
        CÔNG NGHỆ VẢI NỔI BẬT
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-10">
        {materials.map((material) => (
          <MaterialCard key={material.name} material={material} />
        ))}
      </div>
    </section>
  );
}

function MaterialCard({ material }: { material: Material }) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="relative flex aspect-[351/215] w-full items-end overflow-hidden rounded-[5px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.5)]">
        <Image
          src={material.image}
          alt={material.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />
        <p className="relative px-5 pb-5 pt-1 text-lg font-light leading-[1.5] text-white [text-shadow:0px_4px_10px_rgba(0,0,0,0.5)]">
          {material.caption}
        </p>
      </div>

      <div className="flex min-w-0 flex-col items-center">
        <h3 className="w-full px-5 pb-1 pt-5 text-left text-2xl font-bold leading-tight">
          {material.name}
        </h3>
        <p className="w-full px-5 py-1 text-left text-base font-extralight leading-snug">
          {material.composition}
        </p>
        <div className="w-full px-5 py-2.5">
          <div className="h-px w-full bg-black/30" />
        </div>
        {material.features.map((feature) => (
          <p
            key={feature}
            className="w-full px-5 py-1 text-left text-body-sm font-extralight"
          >
            {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
