import { useEffect, useState } from "react";
import { composeStrip } from "../lib/composeStrip";

// photos 배열은 참조가 바뀌면 다시 합성되므로 호출하는 쪽에서 안정적으로 유지하세요.
export default function useComposedImage(photos, frame) {
  const [image, setImage] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    composeStrip(photos, frame)
      .then((url) => !cancelled && setImage(url))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [photos, frame]);

  return { image, failed };
}
