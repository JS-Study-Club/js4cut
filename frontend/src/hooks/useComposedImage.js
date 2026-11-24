import { useEffect, useState } from "react";
import { composeStrip } from "../lib/composeStrip";

// photos 배열은 참조가 바뀌면 다시 합성되므로 호출하는 쪽에서 안정적으로 유지하세요.
// 합성 결과는 어떤 photos/frame 으로 만들었는지와 함께 저장한다.
// 입력이 바뀐 직후에는 이전 결과를 버리고 image 가 null 이 되므로,
// 프레임을 바꾼 뒤 새 합성이 끝나기 전에 옛 이미지가 전송되는 일이 없다.
export default function useComposedImage(photos, frame) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!frame) return; // 프레임 목록을 아직 불러오는 중
    let cancelled = false;
    composeStrip(photos, frame)
      .then((image) => {
        if (!cancelled) setResult({ photos, frame, image, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ photos, frame, image: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [photos, frame]);

  const current =
    result && result.photos === photos && result.frame === frame ? result : null;
  return { image: current?.image ?? null, failed: current?.failed ?? false };
}
