import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Toast from "../components/Toast";
import FrameSwatches from "../components/FrameSwatches";
import useToast from "../hooks/useToast";
import useComposedImage from "../hooks/useComposedImage";
import useFrames from "../hooks/useFrames";
import { devPhotos } from "../lib/devPhotos";
import { sendPhotoEmail } from "../lib/api";
import { savePost } from "../lib/board";
import ExhibitModal from "../components/ExhibitModal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REDIRECT_SECONDS = 5; // 전송이 끝나면 이 시간 뒤 홈으로 돌아간다 (다음 사람이 바로 쓸 수 있게)

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // 촬영 화면에서 navigate("/result", { state: { photos } }) 로 전달. 없으면 개발용 임시 사진.
  const photos = useMemo(
    () => location.state?.photos ?? devPhotos,
    [location.state],
  );

  const { frames } = useFrames();
  const [frameId, setFrameId] = useState(null);
  const frame = frames.find((f) => f.id === frameId) ?? frames[0] ?? null;

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [askExhibit, setAskExhibit] = useState(false);
  // 메인보드에 이미 올린 사진의 id. 메일 전송이 실패해 다시 시도해도 중복 전시되지 않게 보관한다.
  const [photoId, setPhotoId] = useState(null);
  // 전송이 끝난 뒤 홈으로 돌아가기까지 남은 초. 진행 중이 아니면 null
  const [secondsLeft, setSecondsLeft] = useState(null);
  const { toast, hide, showSuccess, showError } = useToast();
  const { image, failed } = useComposedImage(photos, frame);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, navigate]);

  // 프레임을 바꾸면 합성 이미지가 달라지므로 이전 전시 기록은 더 이상 이 사진이 아니다.
  function selectFrame(f) {
    setFrameId(f.id);
    setPhotoId(null);
  }

  // 1) 이메일 검증 → 2) 전시 동의 모달(서버 프레임일 때만) → 3) 전시 저장 → 4) 메일 전송
  function handleSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      showError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    if (!image || !frame) return;
    if (!frame.fromServer || photoId) {
      finish(false); // 전시할 수 없거나 이미 전시한 사진: 모달 없이 메일만
      return;
    }
    setAskExhibit(true);
  }

  async function finish(exhibit) {
    setAskExhibit(false);
    const trimmed = email.trim();
    setSending(true);

    // 전시를 먼저 저장해서 id를 받아야 메일 발송 기록(photo_id)과 연결된다.
    // 저장이 실패해도 메일은 보낸다.
    let id = photoId;
    let exhibitFailed = false;
    if (exhibit && !id) {
      try {
        const post = await savePost({ image, frameId: frame.id });
        id = post.id;
        setPhotoId(id);
      } catch {
        exhibitFailed = true;
      }
    }

    try {
      await sendPhotoEmail({ email: trimmed, image, photoId: id });
    } catch (err) {
      showError(id ? `${err.message} (메인보드 전시는 완료됐어요)` : err.message);
      setSending(false);
      return;
    }

    if (exhibitFailed) {
      showSuccess(`${trimmed}로 사진을 전송했어요. (전시 저장은 실패했어요)`);
    } else if (id) {
      showSuccess(`${trimmed}로 전송했고, 메인보드에도 전시했어요!`);
    } else {
      showSuccess(`${trimmed}로 사진을 전송했어요!`);
    }
    setSending(false);
    setSecondsLeft(REDIRECT_SECONDS);
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
        <FrameSwatches frames={frames} value={frame} onChange={selectFrame} />

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
            disabled={sending || !image || secondsLeft !== null}
            className="h-14 w-full rounded-full bg-slate-900 text-base font-bold text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "보내는 중…" : "사진 받기"}
          </button>
        </form>

        {secondsLeft !== null && (
          <p role="status" className="mt-6 text-center text-sm text-slate-500">
            {secondsLeft}초 뒤 홈으로 돌아가요.{" "}
            <Link to="/" className="font-semibold text-slate-900 underline">
              지금 이동
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
