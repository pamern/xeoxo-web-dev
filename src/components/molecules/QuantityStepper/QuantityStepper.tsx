export function QuantityStepper({
  value,
  min = 1,
  onChange,
  label = "Số lượng",
}: {
  value: number;
  min?: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <div className="inline-flex h-[38px] items-center rounded-pill border border-black bg-white" aria-label={label}>
      <button
        type="button"
        aria-label="Giảm số lượng"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-[36px] w-9 text-base flex items-center justify-center font-bold text-black hover:opacity-75"
      >
        -
      </button>
      <span className="w-10 text-center text-sm font-semibold text-black">{value}</span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={() => onChange(value + 1)}
        className="h-[36px] w-9 text-base flex items-center justify-center font-bold text-black hover:opacity-75"
      >
        +
      </button>
    </div>
  );
}
