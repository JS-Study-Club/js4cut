import { swatchStyle } from "../lib/frames";

export default function FrameSwatches({
  frames,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div
      role="radiogroup"
      aria-label="프레임 선택"
      className="flex flex-wrap justify-center gap-3"
    >
      {frames.map((f) => {
        const selected = f.id === value?.id;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={f.name}
            onClick={() => onChange(f)}
            disabled={disabled}
            style={swatchStyle(f)}
            className={`${f.overlay ? "h-[4.5rem] w-12 rounded-md" : "size-12 rounded-full"} border border-slate-200 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
              selected
                ? "ring-2 ring-slate-900 ring-offset-2"
                : "hover:scale-105"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          />
        );
      })}
    </div>
  );
}
