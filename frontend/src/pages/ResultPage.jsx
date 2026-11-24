import { useMemo, useState } from "react";
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
  const [emailSent, setEmailSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, hide, showSuccess, showError } = useToast();
  const { image, failed } = useComposedImage(photos, frame);

  function selectFrame(f) {
    setFrameId(f.id);
  }

  // 이메일 발송이 성공한 뒤에만 전시 여부를 묻는다.
  async function handleSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      showError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    if (!image || !frame || emailSent) return;

    setSending(true);
    try {
      await sendPhotoEmail({ email: email.trim(), image });
      setEmailSent(true);
      if (frame.fromServer) {
        setAskExhibit(true);
      } else {
        showSuccess("사진을 이메일로 전송했어요.");
        navigate("/");
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleExhibitAgree() {
    setSaving(true);
    try {
      await savePost({ image, frameId: frame.id });
      setAskExhibit(false);
      navigate("/");
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Toast toast={toast} onClose={hide} />
      <ExhibitModal
        open={askExhibit}
        onAgree={handleExhibitAgree}
        onDecline={() => navigate("/")}
        onCancel={() => navigate("/")}
        busy={saving}
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
            disabled={sending || emailSent || !image}
            className="h-14 w-full rounded-full bg-slate-900 text-base font-bold text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "보내는 중…" : emailSent ? "전송 완료" : "사진 받기"}
          </button>
        </form>
      </main>
    </div>
  );
}
