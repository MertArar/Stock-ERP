"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiSend,
  FiShield,
} from "react-icons/fi";

type ForgotPasswordValues = {
  email: string;
  tcLastFour: string;
  newPassword: string;
  confirmPassword: string;
};

type ForgotPasswordErrors = Partial<Record<keyof ForgotPasswordValues, string>>;

type InputFieldProps = {
  id: keyof ForgotPasswordValues;
  label: string;
  value: string;
  error?: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  maxLength?: number;
  icon?: ReactNode;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const initialValues: ForgotPasswordValues = {
  email: "",
  tcLastFour: "",
  newPassword: "",
  confirmPassword: "",
};

function InputField({
  id,
  label,
  value,
  error,
  type,
  placeholder,
  autoComplete,
  inputMode = "text",
  maxLength,
  icon,
  onChange,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div
        className={[
          "flex h-12 items-center rounded-2xl border bg-white px-4 shadow-sm transition",
          "focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5",
          error ? "border-red-300" : "border-slate-200",
        ].join(" ")}
      >
        {icon ? (
          <span className="mr-3 text-lg text-slate-400">{icon}</span>
        ) : null}

        <input
          id={id}
          name={id}
          value={value}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={onChange}
          className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  error,
  placeholder,
  autoComplete,
  onChange,
}: Omit<InputFieldProps, "type" | "inputMode" | "maxLength" | "icon">) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div
        className={[
          "flex h-12 items-center rounded-2xl border bg-white px-4 shadow-sm transition",
          "focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5",
          error ? "border-red-300" : "border-slate-200",
        ].join(" ")}
      >
        <FiLock className="mr-3 text-lg text-slate-400" />

        <input
          id={id}
          name={id}
          value={value}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={onChange}
          className="h-full w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="ml-3 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={isVisible ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          {isVisible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [values, setValues] = useState<ForgotPasswordValues>(initialValues);
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (values.newPassword.length >= 8) score += 1;
    if (/[A-ZÇĞİÖŞÜ]/.test(values.newPassword)) score += 1;
    if (/[a-zçğıöşü]/.test(values.newPassword)) score += 1;
    if (/[0-9]/.test(values.newPassword)) score += 1;
    if (/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/.test(values.newPassword)) score += 1;

    return score;
  }, [values.newPassword]);

  const passwordStrengthText = useMemo(() => {
    if (!values.newPassword) return "Bekleniyor";
    if (passwordStrength <= 2) return "Zayıf";
    if (passwordStrength <= 4) return "Orta";
    return "Güçlü";
  }, [passwordStrength, values.newPassword]);

  const passwordStrengthColor = useMemo(() => {
    if (!values.newPassword) return "bg-slate-100";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-400";
    return "bg-emerald-500";
  }, [passwordStrength, values.newPassword]);

  const passwordStrengthTextColor = useMemo(() => {
    if (!values.newPassword) return "text-slate-400";
    if (passwordStrength <= 2) return "text-red-600";
    if (passwordStrength <= 4) return "text-yellow-600";
    return "text-emerald-600";
  }, [passwordStrength, values.newPassword]);

  const clearFieldError = (fieldName: keyof ForgotPasswordValues) => {
    setErrors((current) => {
      const nextErrors = { ...current };

      delete nextErrors[fieldName];

      if (fieldName === "newPassword") {
        delete nextErrors.confirmPassword;
      }

      return nextErrors;
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof ForgotPasswordValues;

    clearFieldError(fieldName);
    setIsSubmitted(false);

    if (fieldName === "tcLastFour") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 4);

      setValues((current) => ({
        ...current,
        tcLastFour: onlyDigits,
      }));

      return;
    }

    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    const nextErrors: ForgotPasswordErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.email.trim()) {
      nextErrors.email = "Kayıtlı e-posta adresi zorunludur.";
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (!values.tcLastFour.trim()) {
      nextErrors.tcLastFour = "T.C. kimlik numarasının son 4 hanesi zorunludur.";
    } else if (!/^[0-9]{4}$/.test(values.tcLastFour)) {
      nextErrors.tcLastFour = "Son 4 hane yalnızca rakamlardan oluşmalıdır.";
    }

    if (!values.newPassword) {
      nextErrors.newPassword = "Yeni şifre alanı zorunludur.";
    } else if (values.newPassword.length < 8) {
      nextErrors.newPassword = "Yeni şifre en az 8 karakter olmalıdır.";
    } else if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(values.newPassword)) {
      nextErrors.newPassword = "Yeni şifre en az bir harf içermelidir.";
    } else if (!/[0-9]/.test(values.newPassword)) {
      nextErrors.newPassword = "Yeni şifre en az bir rakam içermelidir.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Yeni şifre tekrar alanı zorunludur.";
    } else if (values.newPassword !== values.confirmPassword) {
      nextErrors.confirmPassword = "Yeni şifreler eşleşmiyor.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      setIsSubmitted(false);
      return;
    }

    setIsSubmitted(true);

    console.log("Şifre yenileme formu:", {
      email: values.email.trim(),
      tcLastFour: values.tcLastFour,
      newPassword: values.newPassword,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-950">
      {isSubmitted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
              <FiCheckCircle />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              Şifre başarıyla güncellendi
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Yeni şifrenizle giriş ekranından hesabınıza erişebilirsiniz.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Kapat
              </button>

              <Link
                href="/login"
                className="cursor-pointer rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              >
                Girişe dön
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:min-h-[660px] lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative overflow-hidden bg-slate-900 p-7 text-white sm:p-9 lg:flex lg:flex-col lg:justify-between lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.25),_transparent_35%)]" />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                  <FiShield />
                  Artech Stok Takip
                </div>
              </div>

              <p className="mb-4 inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-200">
                Şifremi Unuttum
              </p>

              <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
                Hesabınız için yeni şifre oluşturun.
              </h1>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 lg:mt-0">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Kullanıcı doğrulama</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Kayıtlı e-posta ve T.C. kimlik numarasının son 4 hanesi
                  birlikte alınır.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Yeni şifre kontrolü</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Yeni şifre ve tekrar alanı eşleştiğinde şifre yenileme akışı
                  tamamlanır.
                </p>
              </div>
            </div>
          </aside>

          <div className="relative flex items-center bg-slate-50 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  id="email"
                  label="Kayıtlı E-posta"
                  value={values.email}
                  error={errors.email}
                  type="email"
                  placeholder="ornek@mail.com"
                  autoComplete="email"
                  inputMode="email"
                  icon={<FiMail />}
                  onChange={handleChange}
                />

                <InputField
                  id="tcLastFour"
                  label="T.C. Kimlik Son 4 Hane"
                  value={values.tcLastFour}
                  error={errors.tcLastFour}
                  type="text"
                  placeholder="1234"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={4}
                  icon={<FiShield />}
                  onChange={handleChange}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordField
                    id="newPassword"
                    label="Yeni Şifre"
                    value={values.newPassword}
                    error={errors.newPassword}
                    placeholder="Yeni Şifre"
                    autoComplete="new-password"
                    onChange={handleChange}
                  />

                  <PasswordField
                    id="confirmPassword"
                    label="Yeni Şifre Tekrar"
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    placeholder="Yeni Şifre Tekrar"
                    autoComplete="new-password"
                    onChange={handleChange}
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">
                      Şifre güvenliği
                    </p>

                    <p
                      className={[
                        "text-xs font-bold",
                        passwordStrengthTextColor,
                      ].join(" ")}
                    >
                      {passwordStrengthText}
                    </p>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={[
                          "h-2 rounded-full transition",
                          index < passwordStrength
                            ? passwordStrengthColor
                            : "bg-slate-100",
                        ].join(" ")}
                      />
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    En az 8 karakter, bir harf ve bir rakam kullanılması gerekir.
                  </p>
                </div>

                <div className="space-y-4 pt-3 sm:pt-5">
                  <button
                    type="submit"
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
                  >
                    <FiSend />
                    Yeni Şifreyi Kaydet
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Şifrenizi hatırladınız mı?{" "}
                    <Link
                      href="/login"
                      className="cursor-pointer font-bold text-slate-950 transition hover:text-cyan-700"
                    >
                      Giriş yap
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}