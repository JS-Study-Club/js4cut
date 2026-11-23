import Header from "../components/Header";
import Hero from "../components/Hero";
import BoardGrid from "../components/BoardGrid";
import useBoardPosts from "../hooks/useBoardPosts";

export default function MainPage() {
  const { posts, loading } = useBoardPosts();
  return (
    <>
      <Header />
      <main className="main">
        <Hero />
        <section aria-labelledby="board-title">
          <h2 id="board-title" className="board-title">
            메인보드
          </h2>
          <BoardGrid posts={posts} loading={loading} />
        </section>
      </main>
    </>
  );
}
