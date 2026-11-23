// 프레임 규격: 300x450 (2:3) 을 3배로 렌더링 → 900x1350
export const FRAME_W = 900;
export const FRAME_H = 1350;

// 2x2 사진 칸 위치 (300x450 기준 px → 비율로 변환). 실제 프레임 디자인에 맞춰 여기만 수정.
const BASE_W = 300;
const BASE_H = 450;
const slot = (x, y, w, h) => ({
  x: x / BASE_W,
  y: y / BASE_H,
  w: w / BASE_W,
  h: h / BASE_H,
});
export const SLOTS = [
  slot(16, 14, 131, 190),
  slot(153, 14, 131, 190),
  slot(16, 210, 131, 190),
  slot(153, 210, 131, 190),
];

// 촬영 화면에서 카메라 미리보기 비율로 쓰세요: 사진 칸과 같은 비율로 찍어야 안 잘려요.
export const SLOT_ASPECT = 131 / 190;

// colors: 단색은 같은 값 두 개, 그라데이션은 다른 값 두 개.
// 실제 이미지 프레임은 src: "/frames/xxx.png" 를 추가하면 배경으로 그려집니다.
export const FRAMES = [
  {
    id: "white",
    name: "화이트",
    colors: ["#ffffff", "#ffffff"],
    textColor: "#222222",
  },
  {
    id: "black",
    name: "블랙",
    colors: ["#000000", "#000000"],
    textColor: "#ffffff",
  },
  {
    id: "sunset",
    name: "노을",
    colors: ["#f6d365", "#fda085"],
    textColor: "#4a2c1a",
  },
  {
    id: "night",
    name: "밤하늘",
    colors: ["#0f2027", "#2c5364"],
    textColor: "#ffffff",
  },
  {
    id: "sky",
    name: "하늘",
    colors: ["#4b79a1", "#a8d0e6"],
    textColor: "#ffffff",
  },
  {
    id: "forest",
    name: "숲",
    colors: ["#2d4a22", "#8fae6b"],
    textColor: "#ffffff",
  },
];

export const swatchStyle = (frame) =>
  frame.src
    ? {
        backgroundImage: `url(${frame.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage: `linear-gradient(160deg, ${frame.colors[0]}, ${frame.colors[1]})`,
      };
