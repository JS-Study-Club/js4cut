import { useEffect, useState } from "react";
import { fetchFrames } from "../lib/api";
import { LOCAL_FRAMES } from "../lib/frames";

// 서버(GET /api/frames)의 프레임 목록. 서버 프레임은 fromServer:true 이고 id 가 uuid 라서
// 메인보드 전시 저장에 쓸 수 있다. 서버가 비었거나 실패하면 번들 프레임(public/frames)으로 대체(전시 불가).
export default function useFrames() {
  const [state, setState] = useState({ frames: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    fetchFrames()
      .then((list) =>
        list.map((f, i) => ({
          id: f.id,
          name: `프레임 ${i + 1}`,
          src: f.imageUrl,
          overlay: true, // 사진 칸이 투명하게 뚫린 PNG: 사진 위에 덮어 그린다
          fromServer: true,
        })),
      )
      .catch(() => [])
      .then((list) => {
        if (cancelled) return;
        setState({ frames: list.length ? list : LOCAL_FRAMES, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
