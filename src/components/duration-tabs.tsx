"use client";

export function matchesTripDuration(days: number | undefined, value: number) {
  return value === -1 || (value === 0 ? days === 4 : value === 1 ? days === 5 : days !== undefined && days >= 6);
}

export default function DurationTabs({ value, onChange, className = "duration-tabs", label = "Trip duration" }: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
}) {
  return <div className={className} role="group" aria-label={label}>
    {["3N/4D", "4N/5D", "5N+"].map((duration, index) => <button
      type="button"
      key={duration}
      aria-pressed={value === index}
      className={value === index ? "selected" : undefined}
      onClick={() => onChange(value === index ? -1 : index)}
    >{duration}</button>)}
  </div>;
}
