// 백엔드 없이 프론트만으로 전체 흐름(프레임 선택 → 전시 동의 → 메일 → 홈)을 확인하기 위한 가짜 API.
// frontend/.env.local 에 VITE_MOCK_API=true 를 넣으면 켜진다. 실제 서버를 쓸 때는 지우거나 false 로.
// 전시한 사진은 이 브라우저(localStorage)에만 저장되고, 메일은 실제로 보내지 않는다.
const KEY = "js4cut:mock-board";
const MAX_STORED = 5; // localStorage(약 5MB) 한도 때문에 최근 몇 장만 보관
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// 서버 프레임처럼 보이게(uuid 와 imageUrl) public/frames 의 번들 프레임을 돌려준다
const FRAME_FILES = [
  "js-yellow",
  "tomato",
  "christmas",
  "yaha-black",
  "mint",
  "star-brown",
];
const fakeUuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export async function mockFetchFrames() {
  await delay(150);
  return FRAME_FILES.map((f, i) => ({
    id: fakeUuid(i + 1),
    imageUrl: `/frames/${f}.png`,
  }));
}

export async function mockFetchBoardPhotos(limit) {
  await delay(150);
  return { photos: read().slice(0, limit), nextBefore: null };
}

export async function mockUploadPhoto({ image, frameId }) {
  await delay(500);
  const post = {
    id: crypto.randomUUID(),
    frameId,
    imageUrl: image,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([post, ...read()].slice(0, MAX_STORED)));
  } catch {
    throw new Error("브라우저 저장 공간이 부족해요.");
  }
  return post;
}

export async function mockSendPhotoEmail({ email, photoId }) {
  await delay(900);
  console.info("[mock] 이메일 전송(실제 발송 아님)", { email, photoId });
  return { ok: true };
}
