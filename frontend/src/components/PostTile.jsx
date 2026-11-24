// 프레임 비율(300x450, 2:3)을 CSS aspect-ratio로 고정 → 어떤 화면 폭에서도 비율 유지.
export default function PostTile({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
  return (
    <article className="tile">
      <img src={post.imageUrl} alt={`${date}에 전시된 네컷`} loading="lazy" />
      <div className="tile__overlay">
        <span>{date}</span>
      </div>
    </article>
  );
}
