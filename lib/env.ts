const required = [
  "GOOGLE_FORM_ACTION_URL",
  "GOOGLE_FORM_ENTRY_STUDENT_NAME",
  "GOOGLE_FORM_ENTRY_SCHOOL_NAME",
  "GOOGLE_FORM_ENTRY_COMPANION",
  "GOOGLE_FORM_ENTRY_PARENT_NAME",
  "GOOGLE_FORM_ENTRY_PHONE",
] as const;

const mailRequired = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "MAIL_FROM",
] as const;

const googleFormDefaults: Partial<Record<EnvName, string>> = {
  GOOGLE_FORM_ACTION_URL:
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSe-3bRfJipoGQgTnT8-77OofVbe5gY6x3WmPUSHNY42kF9qGw/formResponse",
  GOOGLE_FORM_ENTRY_STUDENT_NAME: "entry.1793051154",
  GOOGLE_FORM_ENTRY_SCHOOL_NAME: "entry.948508252",
  GOOGLE_FORM_ENTRY_COMPANION: "entry.151249853",
  GOOGLE_FORM_ENTRY_COMPANION_OTHER: "entry.151249853.other_option_response",
  GOOGLE_FORM_ENTRY_PARENT_NAME: "entry.1611791768",
  GOOGLE_FORM_ENTRY_PHONE: "entry.1166990871",
  GOOGLE_FORM_ENTRY_REGISTRATION_ID: "entry.752712333",
};

type OptionalEnvName =
  | "GOOGLE_FORM_ENTRY_COMPANION_OTHER"
  | "GOOGLE_FORM_ENTRY_REGISTRATION_ID"
  | "GOOGLE_FORM_ENTRY_EMAIL"
  | "MAIL_REPLY_TO"
  | "PUBLIC_BASE_URL";

type EnvName =
  | (typeof required)[number]
  | (typeof mailRequired)[number]
  | OptionalEnvName;

export function getEnv(name: EnvName) {
  const value = process.env[name] ?? googleFormDefaults[name];

  if (
    !value &&
    [...required, ...mailRequired].includes(
      name as (typeof required)[number] | (typeof mailRequired)[number],
    )
  ) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value ?? "";
}

export function assertGoogleFormEnv() {
  for (const key of required) {
    getEnv(key);
  }
}

export function canSendEmail() {
  return mailRequired.every((key) => Boolean(process.env[key]));
}
