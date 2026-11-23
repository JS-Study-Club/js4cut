import Hero from "../components/Hero";
import DriftBoard from "../components/DriftBoard";
import Gallery from "../components/Gallery";
import useBoardPosts from "../hooks/useBoardPosts";

// 전시된 네컷이 흐릿하게 흘러가는 배경 위에, 소개 카드가 가운데에 떠 있는 홈 화면.
export default function MainPage() {
  const { posts } = useBoardPosts();
  return (
    <div className="home">
      <DriftBoard posts={posts} />
      <div className="home__veil" />
      <div className="home__center">
        <Hero />
      </div>
      <Gallery posts={posts} />
    </div>
  );
}
