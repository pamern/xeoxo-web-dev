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
    <div className="inline-flex h-10 items-center rounded-pill border border-black bg-white sm:h-[28px]" aria-label={label}>
      <button
        type="button"
        aria-label="Giam so luong"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-full w-8 items-center justify-center rounded-l-pill text-base font-normal text-black transition hover:bg-black/5 sm:w-[28px]"
      >
        -
      </button>
      <span className="flex h-full w-6 items-center justify-center text-center text-body-sm font-normal text-black">{value}</span>
      <button
        type="button"
        aria-label="Tang so luong"
        onClick={() => onChange(value + 1)}
        className="flex h-full w-8 items-center justify-center rounded-r-pill text-base font-normal text-black transition hover:bg-black/5 sm:w-[28px]"
      >
        +
      </button>
    </div>
  );
}
