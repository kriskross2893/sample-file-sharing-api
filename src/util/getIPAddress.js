export default function(req) {
  return (
    req.headers['x-forwarded-for']
    || req.connection.remoteAddress
    || '')
    .split(',')[0]
    .trim();
}
