import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import ResultPage from "./pages/ResultPage";
import "./index.css";

// 흐름: / → /capture → /frame → (메인보드 모달) → /result(합성 결과 + 이메일) → /
// 촬영이 끝나면 navigate("/result", { state: { photos: [dataUrl x4] } }) 로 넘겨주세요.
const Placeholder = ({ name }) => (
  <p style={{ padding: 40 }}>{name} (준비 중)</p>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/capture" element={<Placeholder name="사진 찍기" />} />
      <Route path="/frame" element={<Placeholder name="프레임 선택" />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}
