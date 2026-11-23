import { FRAME_W, FRAME_H, SLOTS } from "./frames";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
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

  if (frame.src) {
    drawCover(ctx, await loadImage(frame.src), 0, 0, FRAME_W, FRAME_H);
  } else {
    const g = ctx.createLinearGradient(0, 0, FRAME_W * 0.4, FRAME_H);
    g.addColorStop(0, frame.colors[0]);
    g.addColorStop(1, frame.colors[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  }

  const images = await Promise.all(
    photoSrcs.slice(0, SLOTS.length).map(loadImage),
  );
  images.forEach((img, i) => {
    const s = SLOTS[i];
    const x = s.x * FRAME_W;
    const y = s.y * FRAME_H;
    const w = s.w * FRAME_W;
    const h = s.h * FRAME_H;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.clip();
    drawCover(ctx, img, x, y, w, h);
    ctx.restore();
  });

  ctx.fillStyle = frame.textColor;
  ctx.font = '700 44px "Pretendard Variable", Pretendard, system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("js4cut", FRAME_W / 2, FRAME_H - 70);

  return canvas.toDataURL("image/jpeg", 0.92);
}
