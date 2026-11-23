import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabase.js';
import { sendPhotoMail } from '../mailer.js';
import { imageUpload, ALLOWED_IMAGE_TYPES } from '../upload.js';
import { isUuid, isEmail, httpError } from '../validate.js';

const router = Router();

// 같은 IP에서 5분에 10번까지
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  message: { error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' },
});

// POST /api/email - multipart: image, email, photo_id(선택, 메인보드에 올린 사진이면)
// 이미지는 저장하지 않고 받은 그대로 첨부해서 보냄
router.post('/', limiter, imageUpload, async (req, res) => {
  if (!req.file) throw httpError(400, 'image 파일이 필요합니다.');

  const email = String(req.body.email ?? '').trim();
  if (!isEmail(email)) throw httpError(400, '이메일 형식이 올바르지 않습니다.');

  const photoId = req.body.photo_id || null;
  if (photoId && !isUuid(photoId)) throw httpError(400, 'photo_id가 올바르지 않습니다.');

  const { data: log, error: logError } = await supabase
    .from('email_logs')
    .insert({ email, photo_id: photoId, status: 'pending' })
    .select('id')
    .single();
  if (logError) throw logError;

  try {
    await sendPhotoMail({
      to: email,
      image: req.file.buffer,
      ext: ALLOWED_IMAGE_TYPES[req.file.mimetype],
    });
    await supabase
      .from('email_logs')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', log.id);
    res.json({ ok: true });
  } catch (err) {
    await supabase
      .from('email_logs')
      .update({ status: 'failed', error: String(err.message).slice(0, 500) })
      .eq('id', log.id);
    throw httpError(502, '이메일 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
  }
});

export default router;
