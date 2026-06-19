import { randomUUID } from "crypto";

export type RegistrationInput = {
  studentName: string;
  email: string;
  schoolName: string;
  companionChoices: string[];
  companionOther: string;
  companion: string;
  parentName: string;
  phone: string;
};

export type RegistrationRecord = RegistrationInput & {
  id: string;
};

export function createRegistrationId() {
  return randomUUID();
}
