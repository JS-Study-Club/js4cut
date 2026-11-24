import { FRAME_W, FRAME_H, SLOTS, OVERLAY_SLOTS } from "./frames";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // 서버(Supabase) 이미지를 캔버스에 그린 뒤 내보내려면 필요
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// 사진 칸에 꽉 차게(cover) 중앙 크롭해서 그리기
function drawCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(
    img,
    (img.width - sw) / 2,
    (img.height - sh) / 2,
    sw,
    sh,
    x,
    y,
    w,
    h,
  );
}

// 프레임 + 사진 4장 → JPEG data URL (화면 미리보기와 이메일 전송에 같은 이미지를 사용)
export async function composeStrip(photoSrcs, frame) {
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_W;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext("2d");

  if (frame.overlay) {
    // 서버 프레임: 투명 칸이 있는 PNG라서 흰 바탕 → 사진 → 프레임 순서로 그린다
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  } else if (frame.src) {
    drawCover(ctx, await loadImage(frame.src), 0, 0, FRAME_W, FRAME_H);
  } else {
    const g = ctx.createLinearGradient(0, 0, FRAME_W * 0.4, FRAME_H);
    g.addColorStop(0, frame.colors[0]);
    g.addColorStop(1, frame.colors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  }

  // 오버레이 프레임은 틈 없이 칸을 채우고(프레임이 위에서 모양을 잡는다), 색상 프레임은 둥근 칸으로 그린다
  const slots = frame.overlay ? OVERLAY_SLOTS : SLOTS;
  const radius = frame.overlay ? 0 : 12;
  const images = await Promise.all(
    photoSrcs.slice(0, slots.length).map(loadImage),
  );
  images.forEach((img, i) => {
    const s = slots[i];
    const x = s.x * FRAME_W;
    const y = s.y * FRAME_H;
    const w = s.w * FRAME_W;
    const h = s.h * FRAME_H;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
    drawCover(ctx, img, x, y, w, h);
    ctx.restore();
  });

  if (frame.overlay) {
    drawCover(ctx, await loadImage(frame.src), 0, 0, FRAME_W, FRAME_H);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  ctx.fillStyle = frame.textColor;
  ctx.font = '700 44px "Pretendard Variable", Pretendard, system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("js4cut", FRAME_W / 2, FRAME_H - 70);

  return canvas.toDataURL("image/jpeg", 0.92);
}
