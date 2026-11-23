import { useEffect, useState } from "react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

// 홈 오른쪽 아래 "사진 보기" 버튼 + 전시된 네컷을 선명하게 보는 갤러리.
// 갤러리에서 사진을 누르면 크게 보이고, Esc로 한 단계씩 닫힌다.
export default function Gallery({ posts }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected]);

  const close = () => {
    setSelected(null);
    setOpen(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className="gallery-fab"
          onClick={() => setOpen(true)}
          disabled={posts.length === 0}
        >
          사진 보기
        </button>
      )}

      {open && (
        <div
          className="gallery"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-title"
        >
          <header className="gallery__head">
            <h2 id="gallery-title" className="gallery__title">
              전시된 네컷
            </h2>
            <button
              type="button"
              className="btn btn--ghost gallery__close"
              onClick={close}
              autoFocus
            >
              닫기
            </button>
          </header>

          <ul className="gallery__grid">
            {posts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="gallery__item"
                  onClick={() => setSelected(p)}
                  aria-label={`${formatDate(p.createdAt)} 네컷 크게 보기`}
                >
                  <img src={p.imageUrl} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label="네컷 크게 보기"
              onClick={() => setSelected(null)}
            >
              <img
                src={selected.imageUrl}
                alt={`${formatDate(selected.createdAt)}에 전시된 네컷`}
              />
              <button
                type="button"
                className="btn btn--ghost lightbox__close"
                onClick={() => setSelected(null)}
                autoFocus
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
