import PostTile from "./PostTile";

export default function BoardGrid({ posts, loading }) {
  if (loading) {
    return (
      <div className="board" aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="tile tile--skeleton" />
        ))}
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <p className="board__empty">
        아직 전시된 네컷이 없어요. 첫 번째로 걸어보세요.
      </p>
    );
  }
  return (
    <div className="board">
      {posts.map((p) => (
        <PostTile key={p.id} post={p} />
      ))}
    </div>
  );
}
