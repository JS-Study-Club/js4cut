const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// 서버 규약: POST /api/send-email  { email, image(JPEG data URL) }
// 실패 시 { message } 를 담아 4xx/5xx 로 응답하면 그 문구가 토스트에 그대로 표시됩니다.
export async function sendPhotoEmail({ email, image }) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, image }),
    });
  } catch {
    throw new Error("서버에 연결할 수 없어요. 네트워크를 확인해주세요.");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data.message || "사진 전송에 실패했어요. 잠시 후 다시 시도해주세요.",
    );
  }
}
