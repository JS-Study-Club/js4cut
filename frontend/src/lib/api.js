import {
  mockFetchFrames,
  mockFetchBoardPhotos,
  mockUploadPhoto,
  mockSendPhotoEmail,
} from "./mockApi";

// 백엔드(backend/, feature/seoyeon) API 클라이언트.
// 서버 주소는 frontend/.env 의 VITE_API_URL (없으면 로컬 백엔드 기본 포트 4000)
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(
  /\/$/,
  "",
);

// frontend/.env.local 에 VITE_MOCK_API=true 를 넣으면 서버 없이 가짜 응답으로 동작한다 (lib/mockApi.js)
const MOCK = import.meta.env.VITE_MOCK_API === "true";

// 공통 요청: 네트워크 실패/에러 응답({ error })을 사용자에게 보여줄 Error 메시지로 바꿔 던진다.
async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("서버에 연결할 수 없어요. 네트워크를 확인해주세요.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "요청에 실패했어요. 잠시 후 다시 시도해주세요.");
  }
  return res.json();
}

// 합성 이미지(JPEG data URL) → 업로드용 Blob
const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

// GET /api/frames → [{ id(uuid), imageUrl }]
export const fetchFrames = () =>
  MOCK ? mockFetchFrames() : request("/api/frames");

// GET /api/photos?limit=N → { photos: [{ id, frameId, imageUrl, createdAt }], nextBefore }
export const fetchBoardPhotos = (limit = 50) =>
  MOCK ? mockFetchBoardPhotos(limit) : request(`/api/photos?limit=${limit}`);

// POST /api/photos (multipart: image, frame_id) → { id, frameId, imageUrl, createdAt }
// 메인보드 전시에 동의한 사진만 호출할 것.
export async function uploadPhoto({ image, frameId }) {
  if (MOCK) return mockUploadPhoto({ image, frameId });
  const form = new FormData();
  form.append("image", await dataUrlToBlob(image), "js4cut.jpg");
  form.append("frame_id", frameId);
  return request("/api/photos", { method: "POST", body: form });
}

// POST /api/email (multipart: image, email, photo_id?) → { ok: true }
// photoId: 전시에 올린 사진이면 uploadPhoto 가 돌려준 id (발송 기록과 연결됨)
export async function sendPhotoEmail({ email, image, photoId }) {
  if (MOCK) return mockSendPhotoEmail({ email, photoId });
  const form = new FormData();
  form.append("image", await dataUrlToBlob(image), "js4cut.jpg");
  form.append("email", email);
  if (photoId) form.append("photo_id", photoId);
  return request("/api/email", { method: "POST", body: form });
}
