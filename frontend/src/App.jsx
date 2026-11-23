import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import "./index.css";

// 나머지 화면은 만들 때마다 Route만 추가하면 됩니다.
// 흐름: / → /capture → /frame → (메인보드 모달) → /email → /
const Placeholder = ({ name }) => (
  <p style={{ padding: 40 }}>{name} (준비 중)</p>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/capture" element={<Placeholder name="사진 찍기" />} />
      <Route path="/frame" element={<Placeholder name="프레임 선택" />} />
      <Route path="/email" element={<Placeholder name="이메일 입력" />} />
    </Routes>
  );
}
