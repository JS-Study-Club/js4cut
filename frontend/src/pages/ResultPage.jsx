import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import Toast from "../components/Toast";
import FrameSwatches from "../components/FrameSwatches";
import useToast from "../hooks/useToast";
import useComposedImage from "../hooks/useComposedImage";
import { FRAMES } from "../lib/frames";
import { devPhotos } from "../lib/devPhotos";
import { sendPhotoEmail } from "../lib/api";
import { savePost } from "../lib/board";
import ExhibitModal from "../components/ExhibitModal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResultPage() {
  const location = useLocation();
  // 촬영 화면에서 navigate("/result", { state: { photos } }) 로 전달. 없으면 개발용 임시 사진.
  const photos = useMemo(
    () => location.state?.photos ?? devPhotos,
    [location.state],
  );

  const [frame, setFrame] = useState(FRAMES[0]);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [askExhibit, setAskExhibit] = useState(false);
  const { toast, hide, showSuccess, showError } = useToast();
  const { image, failed } = useComposedImage(photos, frame);

  // 1) 이메일 검증 → 2) 전시 동의 모달 → 3) 메일 전송(+ 동의 시 메인보드 저장)
  function handleSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      showError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    if (!image) return;
    setAskExhibit(true);
  }

  async function finish(exhibit) {
    setAskExhibit(false);
    const trimmed = email.trim();
    setSending(true);
    try {
      await sendPhotoEmail({ email: trimmed, image });
    } catch (err) {
      showError(err.message);
      setSending(false);
      return;
    }
    // 메일은 이미 나갔으므로, 전시 저장이 실패해도 전송 성공은 그대로 알린다.
    if (exhibit) {
      try {
        await savePost(image);
        showSuccess(`${trimmed}로 전송했고, 메인보드에도 전시했어요!`);
      } catch {
        showSuccess(`${trimmed}로 사진을 전송했어요. (전시 저장은 실패했어요)`);
      }
    } else {
      showSuccess(`${trimmed}로 사진을 전송했어요!`);
    }
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Toast toast={toast} onClose={hide} />
      <ExhibitModal
        open={askExhibit}
        onAgree={() => finish(true)}
        onDecline={() => finish(false)}
        onCancel={() => setAskExhibit(false)}
      />

      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
          <Link to="/" aria-label="js4cut 홈">
            <img src={logo} alt="" className="size-9 rounded-full" />
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">
            처음으로
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center px-4 pb-12 pt-6">
        <div className="aspect-[2/3] w-64 overflow-hidden rounded-2xl bg-slate-100 shadow-xl shadow-slate-300/60 sm:w-72">
          {image ? (
            <img
              src={image}
              alt="프레임과 사진을 합친 네컷"
              className="size-full object-contain"
            />
          ) : (
            <div
              className={`size-full ${failed ? "" : "animate-pulse"} flex items-center justify-center p-4 text-center text-sm text-slate-500`}
            >
              {failed ? "사진을 합치지 못했어요. 다시 시도해주세요." : ""}
            </div>
          )}
        </div>

        <h2 className="mt-8 mb-3 text-sm font-bold">프레임 선택</h2>
        <FrameSwatches value={frame} onChange={setFrame} />

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full flex-col gap-3"
          noValidate
        >
          <label htmlFor="email" className="sr-only">
            이메일
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="사진을 받을 이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-base outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10"
          />
          <button
            type="submit"
            disabled={sending || !image}
            className="h-14 w-full rounded-full bg-slate-900 text-base font-bold text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "보내는 중…" : "사진 받기"}
          </button>
        </form>
      </main>
    </div>
  );
}
