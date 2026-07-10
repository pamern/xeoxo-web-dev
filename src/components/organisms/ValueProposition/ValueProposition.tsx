import Image from "next/image";

// "ĐỊNH VỊ GIÁ TRỊ" (Figma node 1:195): dải ảnh mỏng phía trên, bên dưới là
// 2 cột — ảnh (trái) và khối nội dung logo + tiêu đề + danh sách (phải).
export function ValueProposition({ values }: { values: string[] }) {
  return (
    <section className="relative">
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

      <div className="value-proposition-shell">
        <div className="value-proposition-media">
          <Image
            src="/images/subtract.png"
            alt="Định vị giá trị Xéo Xọ"
            fill
            sizes="(max-width: 1024px) 100vw, 788px"
            className="object-cover"
          />
        </div>

        <div className="value-proposition-copy">
          <Image
            src="/images/logovang.png"
            alt="XÉO XỌ"
            width={307}
            height={128}
            className="value-proposition-logo"
          />
          <h2 className="text-display-section font-semibold">ĐỊNH VỊ GIÁ TRỊ</h2>
          <ul className="value-proposition-list">
            {values.map((value) => (
              <li key={value} className="value-proposition-item">
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
