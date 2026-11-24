import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { supabase, RESULTS_BUCKET, publicUrl } from '../supabase.js';
import { imageUpload, ALLOWED_IMAGE_TYPES } from '../upload.js';
import { isUuid, httpError } from '../validate.js';

const router = Router();

// POST /api/photos - 메인보드 전시에 동의한 사진만 저장 (multipart: image, frame_id)
router.post('/', imageUpload, async (req, res) => {
  if (!req.file) throw httpError(400, 'image 파일이 필요합니다.');
  const frameId = req.body.frame_id;
  if (!isUuid(frameId)) throw httpError(400, 'frame_id가 올바르지 않습니다.');

  const ext = ALLOWED_IMAGE_TYPES[req.file.mimetype];
  const path = `${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(RESULTS_BUCKET)
    .upload(path, req.file.buffer, { contentType: req.file.mimetype });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('photos')
    .insert({ frame_id: frameId, image_path: path, show_on_board: true })
    .select('id, frame_id, image_path, created_at')
    .single();

  if (error) {
    // DB 등록 실패 시 고아 파일이 남지 않도록 정리
    await supabase.storage.from(RESULTS_BUCKET).remove([path]);
    throw error;
  }

  res.status(201).json(toDto(data));
});

// GET /api/photos?limit=20&before=<created_at> - 메인보드 (최신순, 커서 방식)
router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);

  let query = supabase
    .from('photos')
    .select('id, frame_id, image_path, created_at')
    .eq('show_on_board', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (req.query.before) {
    if (Number.isNaN(Date.parse(req.query.before))) {
      throw httpError(400, 'before 값이 올바른 날짜가 아닙니다.');
    }
    query = query.lt('created_at', req.query.before);
  }

  const { data, error } = await query;
  if (error) throw error;

  res.json({
    photos: data.map(toDto),
    nextBefore: data.length === limit ? data.at(-1).created_at : null,
  });
});

const toDto = (p) => ({
  id: p.id,
  frameId: p.frame_id,
  imageUrl: publicUrl(RESULTS_BUCKET, p.image_path),
  createdAt: p.created_at,
});

export default router;
