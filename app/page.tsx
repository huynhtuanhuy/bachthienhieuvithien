/* eslint-disable @next/next/no-img-element */
"use client";

import { FocusEvent, FormEvent, useState } from "react";
import { ValidationError } from "yup";
import {
  companionOptions,
  registrationFormSchema,
  yupErrorsToFieldMap,
} from "@/lib/validation";

type SubmitResult = {
  id: string;
  qrDataUrl: string;
  message: string;
};

export default function Home() {
  const [isSubmitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [companions, setCompanions] = useState<string[]>([]);
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    setResult(null);
    setSubmitting(true);

    const form = event.currentTarget;
    const payload = getPayload(form);

    try {
      const validPayload = await registrationFormSchema.validate(payload, {
        abortEarly: false,
        stripUnknown: true,
      });
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validPayload),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        throw new Error(data.message || "Đăng ký không thành công.");
      }

      setResult(data);
      setCompanions([]);
      form.reset();
    } catch (submitError) {
      if (submitError instanceof ValidationError) {
        setFieldErrors(yupErrorsToFieldMap(submitError));
        setFormError("Vui lòng kiểm tra lại thông tin đăng ký.");
      } else {
        setFormError(
          submitError instanceof Error
            ? submitError.message
            : "Đăng ký không thành công.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function onCompanionChange(option: string, checked: boolean) {
    setCompanions((current) => {
      const next = checked
        ? [...current, option]
        : current.filter((item) => item !== option);

      validateField("companion", {
        companion: next,
        companionOther: getInputValue("companionOther"),
      });

      if (!next.includes("Khác")) {
        setFieldErrors((errors) => withoutFieldError(errors, "companionOther"));
      }

      return next;
    });
  }

  async function onFieldBlur(
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const field = event.currentTarget.name;
    const payload = getPayload(event.currentTarget.form);
    await validateField(field, payload);
  }

  async function validateField(
    field: string,
    payload: Partial<ReturnType<typeof getPayload>>,
  ) {
    try {
      await registrationFormSchema.validateAt(field, {
        studentName: "",
        email: "",
        schoolName: "",
        companion: companions,
        companionOther: "",
        parentName: "",
        phone: "",
        ...payload,
      });
      setFieldErrors((errors) => withoutFieldError(errors, field));
    } catch (error) {
      if (error instanceof ValidationError) {
        setFieldErrors((errors) => ({
          ...errors,
          [field]: error.message,
        }));
      }
    }
  }

  function resetForAnotherRegistration() {
    setResult(null);
    setFormError("");
    setFieldErrors({});
    setCompanions([]);
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="cover">
          <img src="/banner.jpg" alt="BÁCH THIỆN HIẾU VI TIÊN" />
        </div>

        <section className="formPanel">
          <IntroHtml />

          <form className="registrationForm" onSubmit={onSubmit} noValidate>
            <h2 className="formTitle">Thông tin đăng ký</h2>

            {result ? (
              <div className="successPanel">
                <p className="success">{result.message}</p>
                <button
                  className="submit"
                  type="button"
                  onClick={resetForAnotherRegistration}
                >
                  Gửi đăng ký khác
                </button>
              </div>
            ) : (
              <>
                <label className="field">
                  <span className="label">
                    Họ và Tên <span className="required">*</span>
                  </span>
                  <input
                    className={fieldClass(fieldErrors.studentName)}
                    name="studentName"
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.studentName)}
                    onBlur={onFieldBlur}
                  />
                  <FieldError message={fieldErrors.studentName} />
                </label>

                <label className="field">
                  <span className="label">
                    Email <span className="required">*</span>
                  </span>
                  <input
                    className={fieldClass(fieldErrors.email)}
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    onBlur={onFieldBlur}
                  />
                  <FieldError message={fieldErrors.email} />
                </label>

                <label className="field">
                  <span className="label">
                    Tên trường học sinh đang theo học{" "}
                    <span className="required">*</span>
                  </span>
                  <input
                    className={fieldClass(fieldErrors.schoolName)}
                    name="schoolName"
                    aria-invalid={Boolean(fieldErrors.schoolName)}
                    onBlur={onFieldBlur}
                  />
                  <FieldError message={fieldErrors.schoolName} />
                </label>

                <fieldset className="field checkboxField">
                  <legend className="label">
                    Học sinh sẽ đi cùng ai? <span className="required">*</span>
                  </legend>
                  <p className="hint">Có thể chọn nhiều lựa chọn.</p>
                  <div className="checkboxList">
                    {companionOptions.map((option) => (
                      <label className="checkboxItem" key={option}>
                        <input
                          type="checkbox"
                          name="companion"
                          value={option}
                          checked={companions.includes(option)}
                          onChange={(event) =>
                            onCompanionChange(option, event.target.checked)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError message={fieldErrors.companion} />
                  {companions.includes("Khác") ? (
                    <label className="otherField">
                      <span className="label">Thông tin khác</span>
                      <input
                        className={fieldClass(fieldErrors.companionOther)}
                        name="companionOther"
                        placeholder="Vui lòng nhập người đi cùng khác"
                        aria-invalid={Boolean(fieldErrors.companionOther)}
                        onBlur={onFieldBlur}
                      />
                      <FieldError message={fieldErrors.companionOther} />
                    </label>
                  ) : null}
                </fieldset>

                <label className="field">
                  <span className="label">
                    Họ tên phụ huynh đi cùng học sinh{" "}
                    <span className="required">*</span>
                  </span>
                  <textarea
                    className={`${fieldClass(fieldErrors.parentName)} textarea`}
                    name="parentName"
                    aria-invalid={Boolean(fieldErrors.parentName)}
                    onBlur={onFieldBlur}
                  />
                  <FieldError message={fieldErrors.parentName} />
                </label>

                <label className="field">
                  <span className="label">
                    Số điện thoại liên lạc <span className="required">*</span>
                  </span>
                  <input
                    className={fieldClass(fieldErrors.phone)}
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="0901234567"
                    maxLength={10}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    onBlur={onFieldBlur}
                  />
                  <p className="hint">BTC sẽ liên hệ số này để xác nhận.</p>
                  <FieldError message={fieldErrors.phone} />
                </label>

                <div className="submitArea">
                  {formError ? <p className="formError">{formError}</p> : null}
                  <button
                    className="submit"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang gửi..." : "Đăng ký tham gia"}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

function getPayload(form: HTMLFormElement | null) {
  const formData = new FormData(form ?? undefined);

  return {
    studentName: String(formData.get("studentName") ?? ""),
    email: String(formData.get("email") ?? ""),
    schoolName: String(formData.get("schoolName") ?? ""),
    companion: formData.getAll("companion").map(String),
    companionOther: String(formData.get("companionOther") ?? ""),
    parentName: String(formData.get("parentName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };
}

function getInputValue(name: string) {
  if (typeof document === "undefined") return "";

  const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `[name="${name}"]`,
  );

  return input?.value ?? "";
}

function withoutFieldError(errors: Record<string, string>, field: string) {
  return Object.fromEntries(
    Object.entries(errors).filter(([key]) => key !== field),
  );
}

function IntroHtml() {
  return (
    <div className="introBox">
      <h1>BÁCH THIỆN HIẾU VI TIÊN – LỄ TRI ÂN CHA MẸ, ĐÀ NẴNG 2026</h1>
      <p className="introLead">
        Một đêm lắng lòng để yêu thương được cất thành lời
      </p>
      <div className="introText">
        <p>
          Trong nhịp sống hiện đại đầy bộn bề, chúng ta thường dành nhiều thời
          gian cho công việc, cho những mục tiêu phía trước mà đôi khi quên mất
          rằng phía sau mình luôn có cha mẹ âm thầm dõi theo, yêu thương và hy
          sinh vô điều kiện. Lễ Tri ân Cha Mẹ 2026 với chủ đề &quot;Bách Thiện
          Hiếu Vi Tiên&quot; được tổ chức nhằm tôn vinh giá trị thiêng liêng của
          tình thân, lan tỏa đạo hiếu – nét đẹp cốt lõi trong văn hóa Việt Nam.
        </p>
        <p>
          Sự kiện là dịp để mỗi người con bày tỏ lòng biết ơn đối với đấng sinh
          thành, cùng gia đình trải nghiệm những khoảnh khắc xúc động qua các
          nghi thức tri ân, chương trình nghệ thuật ý nghĩa và không gian kết
          nối yêu thương. Đây không chỉ là một chương trình văn hóa cộng đồng mà
          còn là hành trình nhắc nhở mỗi chúng ta rằng: hiếu kính cha mẹ không
          phải là điều lớn lao ở tương lai, mà bắt đầu từ sự quan tâm chân thành
          trong từng ngày hiện tại.
        </p>
        <p>
          Ban Tổ chức trân trọng mời các gia đình, các thế hệ ông bà, cha mẹ và
          con cháu cùng tham gia để lưu giữ những khoảnh khắc đáng nhớ, gửi trao
          lời yêu thương chưa kịp nói và cùng nhau tạo nên một đêm tri ân đầy
          cảm xúc. Bởi trong cuộc đời mỗi người, thành công lớn nhất không chỉ
          là những gì đạt được, mà còn là khi cha mẹ vẫn còn bên cạnh để được
          yêu thương và báo hiếu.
        </p>
      </div>
      <div className="introClosing">
        <p>
          Hãy dành tặng cha mẹ một buổi tối đặc biệt – nơi những cái ôm được
          trao đi, những lời cảm ơn được cất lên và những giá trị gia đình được
          gìn giữ cho các thế hệ mai sau. ❤️🌸
        </p>
        <p>
          &quot;Bách thiện hiếu vi tiên&quot; – Trong trăm điều thiện, việc Hiếu
          đứng đầu.
        </p>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="fieldError">{message}</p> : null;
}

function fieldClass(error?: string) {
  return error ? "control controlError" : "control";
}
