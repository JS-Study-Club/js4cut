import { useEffect, useMemo, useState } from "react";

const TILE_W = 170; // index.css의 .drift__col 너비와 동일
const GAP = 22; // .drift__tile 의 margin-bottom 및 열 간격과 동일
const TILE_H = TILE_W * 1.5 + GAP;
const SPEED = 6; // 올라가는 속도(px/초). 작을수록 느리다

function useViewport() {
  const [size, setSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  useEffect(() => {
    const onResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// 전시된 네컷이 화면 아래에서 위로 천천히 올라가는 배경.
// 화면을 채우는 만큼만 그려서 가볍게 유지한다. (이미지 수 = 열 수 x 반복 구간 2 x 구간당 장수)
export default function DriftBoard({ posts }) {
  const { w, h } = useViewport();
  const cols = Math.ceil(w / (TILE_W + GAP)) + 1;
  const perHalf = Math.ceil(h / TILE_H) + 1; // 한 구간이 화면 높이보다 길어야 빈틈이 안 생김

  const columns = useMemo(() => {
    if (posts.length === 0) return [];
    return Array.from({ length: cols }, (_, c) => {
      const half = Array.from(
        { length: perHalf },
        (_, j) => posts[(c * 3 + j * 7) % posts.length],
      );
      return [...half, ...half]; // translateY(-50%)에서 이음매 없이 반복
    });
  }, [posts, cols, perHalf]);

  const dur = (perHalf * TILE_H) / SPEED;

  return (
    <div
      className={`drift${columns.length ? " drift--on" : ""}`}
      aria-hidden="true"
    >
      <div className="drift__stage">
        {columns.map((tiles, c) => (
          <div key={c} className="drift__col">
            <div
              className="drift__track"
              style={{ "--dur": `${dur}s`, "--delay": `${-c * 6}s` }}
            >
              {tiles.map((p, i) => (
                <img
                  key={i}
                  className="drift__tile"
                  src={p.imageUrl}
                  alt=""
                  decoding="async"
                  draggable="false"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
