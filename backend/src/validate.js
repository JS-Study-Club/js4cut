const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);
export const isEmail = (v) => typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v);

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
