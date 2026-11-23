import express from 'express';
import cors from 'cors';
import framesRouter from './routes/frames.js';
import photosRouter from './routes/photos.js';
import emailRouter from './routes/email.js';

export const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  }),
);
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/frames', framesRouter);
app.use('/api/photos', photosRouter);
app.use('/api/email', emailRouter);

app.use((_req, res) => res.status(404).json({ error: '존재하지 않는 경로입니다.' }));

// 공통 에러 응답: { error: string }
app.use((err, _req, res, _next) => {
  const status = err.status ?? (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 ? '서버 오류가 발생했습니다.' : err.message,
  });
});
