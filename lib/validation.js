export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function sanitizeString(str) {
  return str
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .substring(0, 2000);   // Limit length to prevent oversized data
}
