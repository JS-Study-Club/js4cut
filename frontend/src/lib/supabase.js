import { createClient } from "@supabase/supabase-js";

// frontend/.env 에 아래 두 값을 넣으면 Supabase가 켜집니다. (없으면 board.js가 브라우저 저장소로 대체)
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
