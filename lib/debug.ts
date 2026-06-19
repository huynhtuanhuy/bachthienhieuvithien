export function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) return email;

  return `${name.slice(0, 2)}***@${domain}`;
}

export function durationMs(startedAt: number) {
  return `${Date.now() - startedAt}ms`;
}
