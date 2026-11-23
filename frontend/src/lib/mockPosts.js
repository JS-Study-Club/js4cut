// Supabase 연결 전 임시 데이터. imageUrl은 "프레임+사진이 합쳐진 최종 네컷 이미지"입니다.
// 합성은 서버(canvas/sharp)에서 하고, 결과 URL만 DB(board_posts)에 저장하는 구조를 가정했습니다.
const COLORS = [
  "#E8B923",
  "#222222",
  "#F2C6D0",
  "#BFD8E8",
  "#CFE3C0",
  "#D9CBEA",
];

function makeStrip(color, seed) {
  // 2x2 사진 칸 + 하단 로고 영역 (프레임 300x450 = 2:3 → 200x300으로 축소)
  const cells = [0, 1, 2, 3]
    .map((i) => {
      const x = 10 + (i % 2) * 93;
      const y = 10 + Math.floor(i / 2) * 116;
      const op = 0.55 + ((seed + i) % 3) * 0.12;
      return `<rect x="${x}" y="${y}" width="87" height="110" rx="3" fill="#fff" opacity="${op}"/>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect width="200" height="300" fill="#fff"/><rect x="0" y="0" width="200" height="242" fill="${color}"/>${cells}<text x="100" y="278" font-size="13" font-weight="700" text-anchor="middle" fill="#222" font-family="sans-serif">js4cut</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const mockPosts = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  imageUrl: makeStrip(COLORS[i % COLORS.length], i),
  createdAt: new Date(Date.now() - i * 3600_000 * 7).toISOString(),
  likes: 12 + ((i * 37) % 120),
}));
