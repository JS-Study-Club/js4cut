import { supabase } from "./supabase";

// Supabase 준비물 (SQL Editor에서 한 번 실행):
//   create table board_posts (
//     id uuid primary key default gen_random_uuid(),
//     image_url text not null,
//     created_at timestamptz not null default now()
//   );
//   alter table board_posts enable row level security;
//   create policy "board read"   on board_posts for select using (true);
//   create policy "board insert" on board_posts for insert with check (true);
//   -- Storage: 'board' 버킷을 Public으로 만들고, anon 업로드(insert) 정책을 추가
const TABLE = "board_posts";
const BUCKET = "board";
const LOCAL_KEY = "js4cut:board";
const LOCAL_MAX = 6; // 브라우저 저장소(약 5MB) 한도 때문에 최근 몇 개만 보관

const toPost = (row) => ({
  id: String(row.id),
  imageUrl: row.image_url,
  createdAt: row.created_at,
});

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

// 메인보드에 전시된 네컷을 최신순으로 가져온다.
export async function fetchPosts(limit = 60) {
  if (!supabase) return readLocal();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(toPost);
}

// 합성된 네컷(JPEG data URL)을 메인보드에 저장한다. 전시에 동의한 경우에만 호출할 것.
export async function savePost(dataUrl) {
  if (!supabase) {
    const post = {
      id: `local-${Date.now()}`,
      imageUrl: dataUrl,
      createdAt: new Date().toISOString(),
    };
    const next = [post, ...readLocal()].slice(0, LOCAL_MAX);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    } catch {
      throw new Error("브라우저 저장 공간이 부족해요.");
    }
    return post;
  }

  const blob = await (await fetch(dataUrl)).blob();
  const path = `${Date.now()}-${crypto.randomUUID()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg" });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ image_url: pub.publicUrl })
    .select("id, image_url, created_at")
    .single();
  if (error) throw error;
  return toPost(data);
}
