import { useEffect, useState } from "react";
import { fetchPosts } from "../lib/board";
import { mockPosts } from "../lib/mockPosts";

const MIN_TILES = 18; // 전시가 적어도 배경이 비어 보이지 않게 샘플 틀로 채운다

// 전시된 네컷(최신순) + 부족하면 샘플 틀. 불러오기에 실패해도 샘플 틀은 보여준다.
export default function useBoardPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPosts()
      .catch(() => [])
      .then((real) => {
        if (cancelled) return;
        const filler = mockPosts.slice(0, Math.max(0, MIN_TILES - real.length));
        setPosts([...real, ...filler]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading };
}
