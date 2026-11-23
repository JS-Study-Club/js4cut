import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <h1 className="hero__title">
        JS와 함께 찍는
        <br />
        우리의 네컷
      </h1>
      <p className="hero__desc">
        네 장을 찍고, 프레임을 고르고, 메일로 받아가세요.
      </p>
      <button className="btn btn--primary" onClick={() => navigate("/capture")}>
        시작하기
      </button>
    </section>
  );
}
