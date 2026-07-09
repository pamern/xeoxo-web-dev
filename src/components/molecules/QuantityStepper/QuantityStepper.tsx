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
    <div className="inline-flex items-center rounded-pill border border-input" aria-label={label}>
      <button
        type="button"
        aria-label="Giam so luong"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-12 w-12 text-xl"
      >
        -
      </button>
      <span className="w-10 text-center text-lg">{value}</span>
      <button
        type="button"
        aria-label="Tang so luong"
        onClick={() => onChange(value + 1)}
        className="h-12 w-12 text-xl"
      >
        +
      </button>
    </div>
  );
}
