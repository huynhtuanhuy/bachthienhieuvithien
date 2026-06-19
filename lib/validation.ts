import * as yup from "yup";
import type { RegistrationInput } from "./registration";

export const companionOptions = ["Bố", "Mẹ", "Ông", "Bà", "Khác"] as const;

export type RegistrationFormValues = {
  studentName: string;
  email: string;
  schoolName: string;
  companion: string[];
  companionOther: string;
  parentName: string;
  phone: string;
};

export const registrationFormSchema: yup.ObjectSchema<RegistrationFormValues> =
  yup.object({
    studentName: yup.string().trim().required("Vui lòng nhập họ và tên."),
    email: yup
      .string()
      .trim()
      .lowercase()
      .email("Email không hợp lệ.")
      .required("Vui lòng nhập email."),
    schoolName: yup.string().trim().required("Vui lòng nhập tên trường."),
    companion: yup
      .array()
      .of(yup.string().oneOf([...companionOptions]).required())
      .min(1, "Vui lòng chọn người đi cùng học sinh.")
      .required("Vui lòng chọn người đi cùng học sinh."),
    companionOther: yup.string().trim().defined().when("companion", {
      is: (value: string[] | undefined) => value?.includes("Khác"),
      then: (schema) =>
        schema.required("Vui lòng nhập thông tin người đi cùng khác."),
      otherwise: (schema) => schema.default("").defined(),
    }),
    parentName: yup
      .string()
      .trim()
      .required("Vui lòng nhập họ tên phụ huynh đi cùng học sinh."),
    phone: yup
      .string()
      .trim()
      .test(
        "vn-phone",
        "Số điện thoại phải gồm đúng 10 chữ số Việt Nam.",
        isVietnamesePhone,
      )
      .required("Vui lòng nhập số điện thoại."),
  });

export async function validateRegistrationPayload(payload: unknown) {
  const values = await registrationFormSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  return toRegistrationInput(values);
}

export function toRegistrationInput(values: RegistrationFormValues) {
  const companion = values.companion
    .map((item) =>
      item === "Khác" ? `Khác: ${values.companionOther.trim()}` : item,
    )
    .join(", ");

  return {
    studentName: values.studentName.trim(),
    email: values.email.trim().toLowerCase(),
    schoolName: values.schoolName.trim(),
    companionChoices: values.companion,
    companionOther: values.companionOther.trim(),
    companion,
    parentName: values.parentName.trim(),
    phone: values.phone.trim(),
  } satisfies RegistrationInput;
}

export function yupErrorsToFieldMap(error: yup.ValidationError) {
  return error.inner.reduce<Record<string, string>>((errors, item) => {
    if (item.path && !errors[item.path]) {
      errors[item.path] = item.message;
    }

    return errors;
  }, {});
}

function isVietnamesePhone(value: string | undefined) {
  if (!value) return false;

  return /^0(?:3|5|7|8|9)\d{8}$/.test(value);
}
