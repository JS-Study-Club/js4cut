import { useEffect } from "react";

// 사진을 다 찍은 뒤 "메인보드에 전시할까요?"를 묻는 동의 모달.
// onAgree: 전시 동의 / onDecline: 전시 안 함 / onCancel: 선택 없이 닫기(Esc, 바깥 클릭)
export default function ExhibitModal({ open, onAgree, onDecline, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exhibit-title"
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="exhibit-title" className="text-xl font-bold">
          메인보드에 전시할까요?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          동의하면 완성된 네컷이 홈 화면 메인보드에 저장되고,
          <br />
          다른 사람들에게도 보여요. (이메일 주소는 저장되지 않아요)
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            autoFocus
            onClick={onAgree}
            className="h-12 rounded-full bg-slate-900 font-bold text-white hover:bg-black"
          >
            네, 전시할래요
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="h-12 rounded-full border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
          >
            아니요, 메일로만 받을래요
          </button>
        </div>
      </div>
    </div>
  );
}
