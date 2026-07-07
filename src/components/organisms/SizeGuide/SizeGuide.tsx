"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SizeRow = { size: string; bust: string; waist: string; hip: string };

const WOMEN_SIZES: SizeRow[] = [
  { size: "S", bust: "82 - 86", waist: "62 - 66", hip: "88 - 92" },
  { size: "M", bust: "86 - 90", waist: "66 - 70", hip: "92 - 96" },
  { size: "L", bust: "90 - 94", waist: "70 - 74", hip: "96 - 100" },
  { size: "XL", bust: "94 - 98", waist: "74 - 78", hip: "100 - 104" },
];

const MEN_SIZES: SizeRow[] = [
  { size: "S", bust: "88 - 92", waist: "74 - 78", hip: "90 - 94" },
  { size: "M", bust: "92 - 96", waist: "78 - 82", hip: "94 - 98" },
  { size: "L", bust: "96 - 100", waist: "82 - 86", hip: "98 - 102" },
  { size: "XL", bust: "100 - 104", waist: "86 - 90", hip: "102 - 106" },
];

const TABS = [
  { id: "nu", label: "Nữ", rows: WOMEN_SIZES },
  { id: "nam", label: "Nam", rows: MEN_SIZES },
] as const;

const MEASURE_STEPS = [
  { title: "Vòng ngực", description: "Đo quanh phần đầy nhất của ngực, giữ thước song song với sàn." },
  { title: "Vòng eo", description: "Đo quanh phần nhỏ nhất của eo, thường ngay trên rốn." },
  { title: "Vòng mông", description: "Đo quanh phần đầy nhất của mông, giữ thước thẳng." },
];

// Bảng size + hướng dẫn đo, chuyển tab Nam/Nữ phía client.
export function SizeGuide() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("nu");
  const current = TABS.find((tab) => tab.id === active) ?? TABS[0];

  return (
    <div className="flex flex-col gap-10">
      <div role="tablist" aria-label="Giới tính" className="flex gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-pill border px-6 py-2.5 text-base transition-colors",
              active === tab.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:border-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <caption className="sr-only">Bảng kích thước {current.label} (đơn vị: cm)</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-3 pr-4 text-base font-medium">Size</th>
              <th scope="col" className="py-3 pr-4 text-base font-medium">Vòng ngực</th>
              <th scope="col" className="py-3 pr-4 text-base font-medium">Vòng eo</th>
              <th scope="col" className="py-3 text-base font-medium">Vòng mông</th>
            </tr>
          </thead>
          <tbody>
            {current.rows.map((row) => (
              <tr key={row.size} className="border-b border-border">
                <td className="py-3 pr-4 font-medium">{row.size}</td>
                <td className="py-3 pr-4 font-light">{row.bust}</td>
                <td className="py-3 pr-4 font-light">{row.waist}</td>
                <td className="py-3 font-light">{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-body-sm text-muted-foreground">Đơn vị: cm</p>
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-medium uppercase">Hướng dẫn cách đo</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {MEASURE_STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-2 rounded-lg border border-border p-6">
              <span className="text-3xl font-medium text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-body-sm font-light text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
