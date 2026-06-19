import { getEnv } from "./env";
import type { RegistrationRecord } from "./registration";
import { durationMs } from "./debug";

export async function submitRegistrationToGoogleForm(
  registration: RegistrationRecord,
) {
  const startedAt = Date.now();
  const now = Date.now();
  const fbzx = createFbzx();
  const formBody = new URLSearchParams();
  const companionEntry = getEnv("GOOGLE_FORM_ENTRY_COMPANION");
  const companionOtherEntry = getEnv("GOOGLE_FORM_ENTRY_COMPANION_OTHER");
  const registrationIdEntry = getEnv("GOOGLE_FORM_ENTRY_REGISTRATION_ID");
  const emailEntry = getEnv("GOOGLE_FORM_ENTRY_EMAIL");

  formBody.set(getEnv("GOOGLE_FORM_ENTRY_STUDENT_NAME"), registration.studentName);
  formBody.set(getEnv("GOOGLE_FORM_ENTRY_SCHOOL_NAME"), registration.schoolName);
  formBody.set(getEnv("GOOGLE_FORM_ENTRY_PARENT_NAME"), registration.parentName);
  formBody.set(getEnv("GOOGLE_FORM_ENTRY_PHONE"), registration.phone);

  for (const choice of registration.companionChoices) {
    formBody.append(
      companionEntry,
      choice === "Khác" && companionOtherEntry ? "__other_option__" : choice,
    );
  }

  if (companionOtherEntry && registration.companionOther) {
    formBody.set(companionOtherEntry, registration.companionOther);
  }

  if (registrationIdEntry) {
    formBody.set(registrationIdEntry, registration.id);
  }

  if (emailEntry) {
    formBody.set(emailEntry, registration.email);
  }

  formBody.set("emailAddress", registration.email);
  formBody.set("dlut", String(now));
  formBody.set(`${companionEntry}_sentinel`, "");
  formBody.set("fvv", "1");
  formBody.set("partialResponse", `[null,null,"${fbzx}"]`);
  formBody.set("pageHistory", "0");
  formBody.set("fbzx", fbzx);
  formBody.set("submissionTimestamp", String(now + 1));

  const actionUrl = getEnv("GOOGLE_FORM_ACTION_URL");

  console.info("[google-form] submit start", {
    id: registration.id,
    actionUrl,
    entries: Array.from(new Set(formBody.keys())),
  });

  const response = await fetch(actionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: formBody,
    redirect: "manual",
  });

  console.info("[google-form] submit response", {
    id: registration.id,
    status: response.status,
    statusText: response.statusText,
    duration: durationMs(startedAt),
  });

  if (response.status >= 400) {
    throw new Error("Không thể lưu đăng ký vào Google Form.");
  }
}

function createFbzx() {
  return String(-Math.floor(Math.random() * 9_000_000_000_000_000_000));
}
