import { sendConfirmationEmail } from "./mail";
import type { RegistrationRecord } from "./registration";
import { maskEmail } from "./debug";

const queue: RegistrationRecord[] = [];
let isProcessing = false;

export function enqueueConfirmationEmail(registration: RegistrationRecord) {
  queue.push(registration);
  console.info("[mail-queue] enqueued", {
    id: registration.id,
    email: maskEmail(registration.email),
    size: queue.length,
  });
  void processQueue();
}

async function processQueue() {
  if (isProcessing) return;

  isProcessing = true;

  while (queue.length > 0) {
    const registration = queue.shift();

    if (!registration) continue;

    try {
      console.info("[mail-queue] sending", {
        id: registration.id,
        email: maskEmail(registration.email),
        remaining: queue.length,
      });
      await sendConfirmationEmail(registration);
      console.info("[mail-queue] sent", {
        id: registration.id,
        email: maskEmail(registration.email),
      });
    } catch (error) {
      console.error("[mail-queue] failed", {
        id: registration.id,
        email: maskEmail(registration.email),
        error,
      });
    }
  }

  isProcessing = false;
}
