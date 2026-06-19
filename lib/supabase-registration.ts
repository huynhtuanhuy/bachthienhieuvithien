import { createClient } from "@supabase/supabase-js";
import { durationMs } from "./debug";
import { getEnv } from "./env";
import type { RegistrationRecord } from "./registration";

const TABLE_NAME = "registrations";

export async function saveRegistrationToSupabase(
  registration: RegistrationRecord,
) {
  const startedAt = Date.now();
  const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        persistSession: false,
      },
    },
  );

  const { error } = await supabase.from(TABLE_NAME).insert({
    id: registration.id,
    student_name: registration.studentName,
    email: registration.email,
    school_name: registration.schoolName,
    companion_choices: registration.companionChoices,
    companion_other: registration.companionOther,
    companion: registration.companion,
    parent_name: registration.parentName,
    phone: registration.phone,
  });

  console.info("[supabase] insert registration", {
    id: registration.id,
    duration: durationMs(startedAt),
    ok: !error,
  });

  if (error) {
    console.error("[supabase] insert failed", {
      id: registration.id,
      code: error.code,
      message: error.message,
    });

    throw new Error("Không thể lưu đăng ký vào Supabase.");
  }
}
