import { NextResponse } from "next/server";
import { assertSupabaseEnv, canSendEmail } from "@/lib/env";
import { enqueueConfirmationEmail } from "@/lib/mail-queue";
import { createQrDataUrl } from "@/lib/qr";
import { createRegistrationId } from "@/lib/registration";
import { durationMs, maskEmail } from "@/lib/debug";
import { saveRegistrationToSupabase } from "@/lib/supabase-registration";
import {
  validateRegistrationPayload,
  yupErrorsToFieldMap,
} from "@/lib/validation";
import { ValidationError } from "yup";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const input = await validateRegistrationPayload(body);

    assertSupabaseEnv();

    const registration = {
      ...input,
      id: createRegistrationId(),
    };

    console.info("[register] start", {
      id: registration.id,
      email: maskEmail(registration.email),
      companion: registration.companion,
    });

    await saveRegistrationToSupabase(registration);

    if (canSendEmail()) {
      enqueueConfirmationEmail(registration);
      console.info("[register] email queued", {
        id: registration.id,
        email: maskEmail(registration.email),
      });
    } else {
      console.info("[register] email skipped: smtp env not configured", {
        id: registration.id,
      });
    }

    console.info("[register] success", {
      id: registration.id,
      duration: durationMs(startedAt),
    });

    return NextResponse.json({
      id: registration.id,
      qrPayload: registration.id,
      qrDataUrl: await createQrDataUrl(registration.id),
      emailQueued: canSendEmail(),
      message: canSendEmail()
        ? "Đăng ký thành công. Email xác nhận sẽ được gửi trong ít phút."
        : "Đăng ký thành công.",
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.warn("[register] validation failed", {
        duration: durationMs(startedAt),
        fields: error.inner.map((item) => item.path).filter(Boolean),
      });

      return NextResponse.json(
        {
          message: "Vui lòng kiểm tra lại thông tin đăng ký.",
          fieldErrors: yupErrorsToFieldMap(error),
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Không thể đăng ký lúc này.";

    console.error("[register] failed", {
      duration: durationMs(startedAt),
      message,
    });

    return NextResponse.json({ message }, { status: 400 });
  }
}
