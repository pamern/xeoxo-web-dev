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
        className="h-full w-[28px] text-base font-medium text-black flex items-center justify-center hover:bg-black/5 rounded-l-pill transition"
      >
        -
      </button>
      <span className="w-[24px] text-center text-body-sm font-medium text-black flex items-center justify-center h-full">{value}</span>
      <button
        type="button"
        aria-label="Tang so luong"
        onClick={() => onChange(value + 1)}
        className="h-full w-[28px] text-base font-medium text-black flex items-center justify-center hover:bg-black/5 rounded-r-pill transition"
      >
        +
      </button>
    </div>
  );
}
