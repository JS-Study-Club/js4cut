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

// 이미지(PNG) 프레임용 사진 칸. 디자인 프레임 6종을 실측한 결과 칸이 모두 125x175(촬영 비율 5:7)이고
// 위치 차이가 3px 이내라서 하나로 쓴다. 칸보다 2px 크게 그려 두면(프레임이 위에 덮여 가려짐) 가장자리에
// 흰 틈이 생기지 않는다. 좌표는 300x450 프레임 기준. 칸 위치가 다른 프레임을 추가하면 여기를 조정.
export const OVERLAY_SLOTS = [
  slot(20, 17, 129, 183),
  slot(150, 17, 129, 183),
  slot(20, 198, 129, 183),
  slot(150, 198, 129, 183),
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

// 서버 연결이 안 될 때 쓰는 번들 프레임 (public/frames, 사진 칸이 투명한 900x1350 PNG).
// 서버 프레임과 달리 fromServer 가 아니라서 메인보드 전시는 할 수 없다.
const local = (id, name, file) => ({
  id,
  name,
  src: `/frames/${file}`,
  overlay: true,
});
export const LOCAL_FRAMES = [
  local("local-js", "JS", "js-yellow.png"),
  local("local-tomato", "토마토", "tomato.png"),
  local("local-christmas", "크리스마스", "christmas.png"),
  local("local-yaha", "야하", "yaha-black.png"),
  local("local-mint", "민트", "mint.png"),
  local("local-star", "별", "star-brown.png"),
];

export const swatchStyle = (frame) =>
  frame.overlay
    ? {
        // 사진 칸이 투명한 프레임: 흰 바탕 위에 통째로 보여줘야 프레임 모양이 구분된다
        backgroundColor: "#fff",
        backgroundImage: `url(${frame.src})`,
        backgroundSize: "100% 100%",
      }
    : frame.src
    ? {
        backgroundImage: `url(${frame.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage: `linear-gradient(160deg, ${frame.colors[0]}, ${frame.colors[1]})`,
      };
