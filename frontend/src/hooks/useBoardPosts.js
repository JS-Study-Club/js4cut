import { useEffect, useState } from "react";
import { mockPosts } from "../lib/mockPosts";

// TODO: 서버 연결 시 GET /api/board?cursor=... 로 교체 (Supabase board_posts 테이블)
export default function useBoardPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return { posts, loading };
}
