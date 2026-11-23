import multer from 'multer';

export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// 메모리에만 올리고 디스크에는 저장하지 않음
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES[file.mimetype]) return cb(null, true);
    const err = new Error('jpg, png, webp 이미지만 업로드할 수 있습니다.');
    err.status = 400;
    cb(err);
  },
}).single('image');
