// Render 무료 플랜은 SMTP 포트(25/465/587)를 막으므로 HTTPS 기반 Resend API로 전송
const { RESEND_API_KEY, MAIL_FROM } = process.env;

export async function sendPhotoMail({ to, image, ext }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY가 설정되지 않았습니다.');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: MAIL_FROM ?? 'js4cut <onboarding@resend.dev>',
      to: [to],
      subject: '[js4cut] 인생네컷이 도착했어요 📸',
      text: '오늘의 인생네컷을 첨부해 보내드려요. 즐거운 추억 되세요!',
      attachments: [{ filename: `js4cut.${ext}`, content: image.toString('base64') }],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}
