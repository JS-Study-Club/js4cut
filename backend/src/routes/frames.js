import { Router } from 'express';
import { supabase, FRAMES_BUCKET, publicUrl } from '../supabase.js';

const router = Router();

// GET /api/frames - 프레임 목록
router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('frames').select('id, image_path');
  if (error) throw error;

  res.json(
    data.map((f) => ({
      id: f.id,
      imageUrl: publicUrl(FRAMES_BUCKET, f.image_path),
    })),
  );
});

export default router;
