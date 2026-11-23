const STYLES = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
};

function Icon({ type }) {
  const path =
    type === "success"
      ? "M5 13l4 4L19 7"
      : "M12 8v5m0 3.5h.01M10.3 3.9L2.4 17.6A2 2 0 004.1 20.6h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z";
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        key={toast.id}
        role={toast.type === "error" ? "alert" : "status"}
        className={`pointer-events-auto flex max-w-md animate-toast-in items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold shadow-lg motion-reduce:animate-none ${STYLES[toast.type]}`}
      >
        <Icon type={toast.type} />
        <span className="break-all">{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="-mr-1 ml-1 rounded-full p-1 opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
