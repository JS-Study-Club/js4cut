import { useCallback, useEffect, useRef, useState } from "react";
import { PHOTO_RATIO } from "../lib/photo";

const MAX_HEIGHT = 1400; // 저장되는 사진의 최대 높이(px). 너비는 비율대로 계산

function toMessage(err) {
  switch (err?.name) {
    case "NotAllowedError":
      return "카메라 권한이 거부되었어요. 브라우저 주소창의 카메라 설정에서 허용해 주세요.";
    case "NotFoundError":
      return "연결된 카메라를 찾을 수 없어요.";
    case "NotReadableError":
      return "다른 프로그램이 카메라를 사용 중이에요. 닫고 다시 시도해 주세요.";
    default:
      return "카메라를 시작할 수 없어요. (HTTPS 또는 localhost에서만 동작해요)";
  }
}

// 웹캠 스트림을 <video ref={videoRef}>에 연결하고,
// capture()로 가운데 정사각형을 잘라낸 JPEG(dataURL)를 돌려준다.
// 미리보기가 거울 모드(scaleX(-1))라서 저장 이미지도 좌우 반전해 화면과 똑같이 맞춘다.
export default function useCamera() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let stream = null;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("unsupported");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(toMessage(err));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    // 영상 가운데에서 PHOTO_RATIO(125:175)에 맞는 가장 큰 영역을 잘라낸다.
    let cropH = video.videoHeight;
    let cropW = cropH * PHOTO_RATIO;
    if (cropW > video.videoWidth) {
      cropW = video.videoWidth;
      cropH = cropW / PHOTO_RATIO;
    }
    const outH = Math.round(Math.min(cropH, MAX_HEIGHT));
    const outW = Math.round(outH * PHOTO_RATIO);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    ctx.translate(outW, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      (video.videoWidth - cropW) / 2,
      (video.videoHeight - cropH) / 2,
      cropW,
      cropH,
      0,
      0,
      outW,
      outH,
    );
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  return { videoRef, status, error, capture };
}
