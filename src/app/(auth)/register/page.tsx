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
  FiUser,
} from "react-icons/fi";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  tcNo: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

type InputFieldProps = {
  id: keyof RegisterFormValues;
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

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  tcNo: "",
  password: "",
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

export default function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (values.password.length >= 8) score += 1;
    if (/[A-ZÇĞİÖŞÜ]/.test(values.password)) score += 1;
    if (/[a-zçğıöşü]/.test(values.password)) score += 1;
    if (/[0-9]/.test(values.password)) score += 1;
    if (/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/.test(values.password)) score += 1;

    return score;
  }, [values.password]);

  const passwordStrengthText = useMemo(() => {
    if (!values.password) return "Bekleniyor";
    if (passwordStrength <= 2) return "Zayıf";
    if (passwordStrength <= 4) return "Orta";
    return "Güçlü";
  }, [passwordStrength, values.password]);

  const passwordStrengthColor = useMemo(() => {
    if (!values.password) return "bg-slate-100";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-400";
    return "bg-emerald-500";
  }, [passwordStrength, values.password]);

  const passwordStrengthTextColor = useMemo(() => {
    if (!values.password) return "text-slate-400";
    if (passwordStrength <= 2) return "text-red-600";
    if (passwordStrength <= 4) return "text-yellow-600";
    return "text-emerald-600";
  }, [passwordStrength, values.password]);

  const clearFieldError = (fieldName: keyof RegisterFormValues) => {
    setErrors((current) => {
      const nextErrors = { ...current };

      delete nextErrors[fieldName];

      if (fieldName === "password") {
        delete nextErrors.confirmPassword;
      }

      return nextErrors;
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof RegisterFormValues;

    clearFieldError(fieldName);
    setIsSubmitted(false);

    if (fieldName === "tcNo") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 11);

      setValues((current) => ({
        ...current,
        tcNo: onlyDigits,
      }));

      return;
    }

    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    const nextErrors: RegisterFormErrors = {};

    const nameRegex = /^[A-Za-zÇĞİÖŞÜçğıöşü\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.firstName.trim()) {
      nextErrors.firstName = "Ad alanı zorunludur.";
    } else if (values.firstName.trim().length < 2) {
      nextErrors.firstName = "Ad en az 2 karakter olmalıdır.";
    } else if (!nameRegex.test(values.firstName.trim())) {
      nextErrors.firstName = "Ad alanında yalnızca harf kullanılmalıdır.";
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = "Soyad alanı zorunludur.";
    } else if (values.lastName.trim().length < 2) {
      nextErrors.lastName = "Soyad en az 2 karakter olmalıdır.";
    } else if (!nameRegex.test(values.lastName.trim())) {
      nextErrors.lastName = "Soyad alanında yalnızca harf kullanılmalıdır.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "E-posta alanı zorunludur.";
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = "Geçerli bir e-posta adresi giriniz.";
    }

    if (!values.tcNo.trim()) {
      nextErrors.tcNo = "T.C. kimlik numarası zorunludur.";
    } else if (!/^[1-9][0-9]{10}$/.test(values.tcNo)) {
      nextErrors.tcNo =
        "T.C. kimlik numarası 11 haneli olmalı ve 0 ile başlamamalıdır.";
    }

    if (!values.password) {
      nextErrors.password = "Şifre alanı zorunludur.";
    } else if (values.password.length < 8) {
      nextErrors.password = "Şifre en az 8 karakter olmalıdır.";
    } else if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(values.password)) {
      nextErrors.password = "Şifre en az bir harf içermelidir.";
    } else if (!/[0-9]/.test(values.password)) {
      nextErrors.password = "Şifre en az bir rakam içermelidir.";
    }

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = "Şifre tekrar alanı zorunludur.";
    } else if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = "Şifreler eşleşmiyor.";
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

    console.log("Kayıt formu:", {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      tcNo: values.tcNo,
      password: values.password,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">

        <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:min-h-[720px] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative overflow-hidden bg-slate-900 p-7 text-white sm:p-9 lg:flex lg:flex-col lg:justify-between lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.25),_transparent_35%)]" />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between gap-3">
                <Link
                  href="/login"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <FiArrowLeft />
                  Girişe dön
                </Link>

                <div className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950">
                  Yeni hesap
                </div>
              </div>

              <p className="mb-4 inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-200">
                Kayıt Ol
              </p>

              <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
                Hesabınızı oluşturun
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
                Kullanıcı bilgilerinizi eksiksiz girerek Artech stok takip
                paneli için hesap oluşturabilirsiniz.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 lg:mt-0">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Güvenli kullanıcı kaydı</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Kimlik, e-posta ve şifre alanları uygun input tipleriyle
                  kontrol edilir.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Responsive arayüz</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Masaüstü, tablet ve mobil ekranlarda dengeli bir form deneyimi
                  sunar.
                </p>
              </div>
            </div>
          </aside>

          <div className="relative flex items-center bg-slate-50 px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <div className="w-full">
              {isSubmitted ? (
                <div className="mb-5 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  <FiCheckCircle className="mt-0.5 text-xl" />
                  <div>
                    <p className="text-sm font-bold">
                      Kayıt bilgileri hazırlandı.
                    </p>
                    <p className="mt-1 text-xs leading-5">
                      Backend bağlantısı olmadığı için form şimdilik console
                      üzerinden kontrol ediliyor.
                    </p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    id="firstName"
                    label="Ad"
                    value={values.firstName}
                    error={errors.firstName}
                    type="text"
                    placeholder="Adınızı girin"
                    autoComplete="given-name"
                    icon={<FiUser />}
                    onChange={handleChange}
                  />

                  <InputField
                    id="lastName"
                    label="Soyad"
                    value={values.lastName}
                    error={errors.lastName}
                    type="text"
                    placeholder="Soyadınızı girin"
                    autoComplete="family-name"
                    icon={<FiUser />}
                    onChange={handleChange}
                  />
                </div>

                <InputField
                  id="email"
                  label="E-posta"
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
                  id="tcNo"
                  label="T.C. Kimlik No"
                  value={values.tcNo}
                  error={errors.tcNo}
                  type="text"
                  placeholder="11 haneli kimlik numaranızı girin"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={11}
                  icon={<FiUser />}
                  onChange={handleChange}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordField
                    id="password"
                    label="Şifre"
                    value={values.password}
                    error={errors.password}
                    placeholder="Şifrenizi girin"
                    autoComplete="new-password"
                    onChange={handleChange}
                  />

                  <PasswordField
                    id="confirmPassword"
                    label="Şifre Tekrar"
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    placeholder="Şifrenizi tekrar girin"
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

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
                >
                  Hesap Oluştur
                </button>

                <p className="text-center text-sm text-slate-500">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/login"
                    className="cursor-pointer font-bold text-slate-950 transition hover:text-cyan-700"
                  >
                    Giriş yap
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}