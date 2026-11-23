import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useCamera from "../hooks/useCamera";

const TOTAL_SHOTS = 4; // 네 번만 촬영
const COUNT_START = 5; // 카운트다운 시작 숫자(초)

export default function CapturePage() {
  const navigate = useNavigate();
  const { videoRef, status, error, capture } = useCamera();

  const [phase, setPhase] = useState("idle"); // idle | counting | paused | done
  const [count, setCount] = useState(COUNT_START);
  const [photos, setPhotos] = useState([]);
  const [flashKey, setFlashKey] = useState(0);

  // 카운트다운: 1초마다 줄이다가 0이 되면 촬영 → 4장이 차면 종료
  useEffect(() => {
    if (phase !== "counting") return;
    const timer = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
        return;
      }
      const shot = capture();
      if (!shot) {
        setPhase("idle"); // 카메라 프레임을 못 읽은 경우: 처음 상태로
        return;
      }
      const next = [...photos, shot];
      setPhotos(next);
      setFlashKey((k) => k + 1);
      setCount(COUNT_START);
      // 한 장 찍을 때마다 멈춰서, 다음 사람/포즈를 준비한 뒤 "이어하기"로 진행
      setPhase(next.length >= TOTAL_SHOTS ? "done" : "paused");
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase, count, photos, capture]);

  const start = () => {
    setPhotos([]);
    setCount(COUNT_START);
    setPhase("counting");
  };

  // 다음 컷 카운트다운 시작 (이어하기)
  const resume = () => {
    setCount(COUNT_START);
    setPhase("counting");
  };

  // 카운트다운 중단: 찍은 사진은 유지하고 대기 상태로
  const stop = () => {
    setCount(COUNT_START);
    setPhase("paused");
  };

  const goNext = () => navigate("/result", { state: { photos } });

  const ready = status === "ready";

  return (
    <>
      <Header />
      <main className="capture">
        <div className="stage">
          <video
            ref={videoRef}
            className="stage__video"
            playsInline
            muted
            aria-label="카메라 미리보기"
          />

          {status === "loading" && (
            <div className="stage__msg">카메라 연결 중…</div>
          )}
          {status === "error" && (
            <div className="stage__msg" role="alert">
              {error}
            </div>
          )}

          {phase === "counting" && (
            <div className="stage__count" aria-live="assertive">
              <span key={count}>{count}</span>
            </div>
          )}
          {flashKey > 0 && <div key={flashKey} className="stage__flash" />}

          <div className="stage__badge">
            {Math.min(photos.length + (phase === "counting" ? 1 : 0), TOTAL_SHOTS)}{" "}
            / {TOTAL_SHOTS}
          </div>
        </div>

        <div className="capture__side">
          <h1 className="capture__title">사진 찍기</h1>
          <p className="capture__desc">
            {phase === "done"
              ? "네 장을 모두 찍었어요. 프레임을 고르러 가요."
              : phase === "paused"
                ? "준비되면 '이어하기'를 눌러 주세요."
                : `${TOTAL_SHOTS}장을 찍어요. 한 장씩 카운트다운 후 찍혀요.`}
          </p>

          <ol className="shots" aria-label="찍은 사진">
            {Array.from({ length: TOTAL_SHOTS }, (_, i) => (
              <li key={i} className="shots__slot">
                {photos[i] ? (
                  <img src={photos[i]} alt={`${i + 1}번째 사진`} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </li>
            ))}
          </ol>

          <div className="capture__actions">
            {phase === "idle" && (
              <button className="btn btn--primary" onClick={start} disabled={!ready}>
                촬영 시작
              </button>
            )}
            {phase === "counting" && (
              <button className="btn btn--ghost" onClick={stop}>
                중단
              </button>
            )}
            {phase === "paused" && (
              <button className="btn btn--primary" onClick={resume}>
                이어하기
              </button>
            )}
            {phase === "done" && (
              <button className="btn btn--primary" onClick={goNext}>
                프레임 선택하기
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
