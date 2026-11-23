import { FRAMES, swatchStyle } from "../lib/frames";

export default function FrameSwatches({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="프레임 선택"
      className="flex flex-wrap justify-center gap-3"
    >
      {FRAMES.map((f) => {
        const selected = f.id === value.id;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={f.name}
            onClick={() => onChange(f)}
            style={swatchStyle(f)}
            className={`size-12 rounded-full border border-slate-200 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
              selected
                ? "ring-2 ring-slate-900 ring-offset-2"
                : "hover:scale-105"
            }`}
          />
        );
      })}
    </div>
  );
}
