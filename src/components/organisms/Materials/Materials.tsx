import Image from "next/image";
import type { Material } from "@/types/product.types";

// "CÔNG NGHỆ VẢI NỔI BẬT" — hàng 4 card chất liệu vải (Figma node 1:196).
export function Materials({ materials }: { materials: Material[] }) {
  return (
    <section className="mx-auto flex w-full max-w-site flex-col gap-9 px-6 py-10 xl:px-gutter">
      <h2 className="text-heading-section font-medium leading-tight">CÔNG NGHỆ VẢI NỔI BẬT</h2>
      <div className="grid gap-x-[41px] gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {materials.map((material) => (
          <MaterialCard key={material.name} material={material} />
        ))}
      </div>
    </section>
  );
}

function MaterialCard({ material }: { material: Material }) {
  return (
    <div className="flex flex-col">
      {/* Ảnh + overlay gradient + caption trắng */}
      <div className="relative flex h-[215px] items-end overflow-hidden rounded-[5px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.5)]">
        <Image src={material.image} alt={material.name} fill sizes="351px" className="object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />
        <p className="relative px-[25px] pb-5 pt-[5px] text-body-lg font-light text-white [text-shadow:0px_4px_10px_rgba(0,0,0,0.5)]">
          {material.caption}
        </p>
      </div>

      {/* Tên + thành phần + features */}
      <div className="flex flex-col items-center">
        <h3 className="w-full whitespace-nowrap px-5 pb-[5px] pt-5 text-left text-heading-card font-bold leading-tight">
          {material.name}
        </h3>
        <p className="w-full px-[25px] py-[5px] text-left text-body font-extralight leading-snug">{material.composition}</p>
        <div className="w-full px-[25px] py-[10px]">
          <div className="h-px w-full bg-black/30" />
        </div>
        {material.features.map((feature) => (
          <p key={feature} className="w-full px-[25px] py-[5px] text-left text-body-sm font-extralight">
            {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
