// Render 무료 플랜은 SMTP 포트(25/465/587)를 막으므로 HTTPS 기반 Gmail API로 전송
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER } = process.env;

let cached = { token: null, expiresAt: 0 };

async function getAccessToken() {
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID ?? '',
      client_secret: GMAIL_CLIENT_SECRET ?? '',
      refresh_token: GMAIL_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text().catch(() => '')}`);

  const data = await res.json();
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

const b64 = (buf) => Buffer.from(buf).toString('base64');
const wrap = (s) => s.match(/.{1,76}/g)?.join('\r\n') ?? '';
const encodeHeader = (s) => `=?UTF-8?B?${b64(s)}?=`;

function buildMime({ to, subject, text, filename, mimeType, image }) {
  const boundary = `js4cut_${Date.now().toString(36)}`;
  return [
    `From: ${encodeHeader('js4cut')} <${GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(b64(text)),
    `--${boundary}`,
    `Content-Type: ${mimeType}; name="${filename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${filename}"`,
    '',
    wrap(b64(image)),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

export async function sendPhotoMail({ to, image, ext }) {
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_USER) {
    throw new Error('GMAIL_* 환경변수가 설정되지 않았습니다.');
  }

  const raw = buildMime({
    to,
    subject: '[js4cut] 인생네컷이 도착했어요 📸',
    text: '오늘의 인생네컷을 첨부해 보내드려요. 즐거운 추억 되세요!',
    filename: `js4cut.${ext}`,
    mimeType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`,
    image,
  });

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Gmail ${res.status}: ${await res.text().catch(() => '')}`);
}
