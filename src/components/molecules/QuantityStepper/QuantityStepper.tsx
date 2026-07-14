export function QuantityStepper({
  value,
  min = 1,
  onChange,
  label = "So luong",
}: {
  value: number;
  min?: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-pill border border-black h-[28px] bg-white" aria-label={label}>
      <button
        type="button"
        aria-label="Giam so luong"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-full w-[28px] text-base font-normal text-black flex items-center justify-center hover:bg-black/5 rounded-l-pill transition"
      >
        -
      </button>
      <span className="flex h-full w-[24px] items-center justify-center text-center text-body-sm font-normal text-black">{value}</span>
      <button
        type="button"
        aria-label="Tang so luong"
        onClick={() => onChange(value + 1)}
        className="h-full w-[28px] text-base font-normal text-black flex items-center justify-center hover:bg-black/5 rounded-r-pill transition"
      >
        +
      </button>
    </div>
  );
}
