const supabaseRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const mailRequired = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_FROM",
] as const;

type OptionalEnvName = "MAIL_REPLY_TO" | "PUBLIC_BASE_URL";

type EnvName =
  | (typeof supabaseRequired)[number]
  | (typeof mailRequired)[number]
  | OptionalEnvName;

export function getEnv(name: EnvName) {
  const value = process.env[name];

  if (
    !value &&
    [...supabaseRequired, ...mailRequired].includes(
      name as
        | (typeof supabaseRequired)[number]
        | (typeof mailRequired)[number],
    )
  ) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value ?? "";
}

export function assertSupabaseEnv() {
  for (const key of supabaseRequired) {
    getEnv(key);
  }
}

export function canSendEmail() {
  return mailRequired.every((key) => Boolean(process.env[key]));
}
