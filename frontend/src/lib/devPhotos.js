// 촬영 화면이 아직 없을 때 /result 를 확인하기 위한 임시 사진 4장
const HUES = [210, 340, 40, 150];
export const devPhotos = HUES.map((h, i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="524" height="760"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},70%,80%)"/><stop offset="1" stop-color="hsl(${h + 30},60%,55%)"/></linearGradient></defs><rect width="524" height="760" fill="url(#g)"/><text x="262" y="400" font-size="120" text-anchor="middle" fill="#fff" font-family="sans-serif">${i + 1}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
});
