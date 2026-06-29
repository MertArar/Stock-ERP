"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiMail,
  FiShield,
  FiUserPlus,
} from "react-icons/fi";

type LoginFormValues = {
  identifier: string;
  password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

type InputFieldProps = {
  id: keyof LoginFormValues;
  label: string;
  value: string;
  error?: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  icon?: ReactNode;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const initialValues: LoginFormValues = {
  identifier: "",
  password: "",
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
}: Omit<InputFieldProps, "type" | "inputMode" | "icon">) {
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

export default function LoginPage() {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const clearFieldError = (fieldName: keyof LoginFormValues) => {
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[fieldName];

      return nextErrors;
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof LoginFormValues;

    clearFieldError(fieldName);
    setIsSubmitted(false);

    if (fieldName === "identifier") {
      const nextValue = /^[0-9]*$/.test(value) ? value.slice(0, 11) : value;

      setValues((current) => ({
        ...current,
        identifier: nextValue,
      }));

      return;
    }

    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }));
  };

  const validateIdentifier = (identifier: string) => {
    const cleanIdentifier = identifier.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tcNoRegex = /^[1-9][0-9]{10}$/;

    if (!cleanIdentifier) {
      return "E-posta veya T.C. kimlik numarası zorunludur.";
    }

    if (cleanIdentifier.includes("@")) {
      if (!emailRegex.test(cleanIdentifier)) {
        return "Geçerli bir e-posta adresi giriniz.";
      }

      return "";
    }

    if (!tcNoRegex.test(cleanIdentifier)) {
      return "T.C. kimlik numarası 11 haneli olmalı ve 0 ile başlamamalıdır.";
    }

    return "";
  };

  const validateForm = () => {
    const nextErrors: LoginFormErrors = {};

    const identifierError = validateIdentifier(values.identifier);

    if (identifierError) {
      nextErrors.identifier = identifierError;
    }

    if (!values.password) {
      nextErrors.password = "Şifre alanı zorunludur.";
    } else if (values.password.length < 8) {
      nextErrors.password = "Şifre en az 8 karakter olmalıdır.";
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

    console.log("Giriş formu:", {
      identifier: values.identifier.trim(),
      password: values.password,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-950">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">

        <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr]">
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
                Giriş Yap
              </p>

              <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
                Stok yönetim panelinize güvenli giriş yapın.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
                E-posta adresiniz veya T.C. kimlik numaranız ile hesabınıza
                giriş yapabilir, stok süreçlerini yönetmeye devam edebilirsiniz.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 lg:mt-0">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Tek giriş alanı</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Kullanıcı e-posta adresiyle veya T.C. kimlik numarasıyla
                  giriş yapabilir.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Responsive tasarım</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Masaüstü, tablet ve mobil ekranlarda form yapısı dengeli
                  kalır.
                </p>
              </div>
            </div>
          </aside>

          <div className="relative flex items-center bg-slate-50 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="w-full">
              {isSubmitted ? (
                <div className="mb-6 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  <FiCheckCircle className="mt-0.5 text-xl" />
                  <div>
                    <p className="text-sm font-bold">Giriş bilgileri hazırlandı.</p>
                    <p className="mt-1 text-xs leading-5">
                      Backend bağlantısı olmadığı için form şimdilik console
                      üzerinden kontrol ediliyor.
                    </p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  id="identifier"
                  label="E-posta veya T.C. Kimlik No"
                  value={values.identifier}
                  error={errors.identifier}
                  type="text"
                  placeholder="ornek@mail.com veya 12345678910"
                  autoComplete="username"
                  inputMode="email"
                  icon={<FiMail />}
                  onChange={handleChange}
                />

                <PasswordField
                  id="password"
                  label="Şifre"
                  value={values.password}
                  error={errors.password}
                  placeholder="Şifrenizi girin"
                  autoComplete="current-password"
                  onChange={handleChange}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-950 accent-slate-950"
                    />
                    Beni hatırla
                  </label>

                    <Link
                    href="/forgot-password"
                    className="cursor-pointer text-left text-sm font-bold text-slate-950 transition hover:text-cyan-700 sm:text-right"
                    >
                    Şifremi unuttum
                    </Link>
                </div>

                <div className="space-y-4 pt-5 sm:pt-7">
                  <button
                    type="submit"
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
                  >
                    <FiLogIn />
                    Giriş Yap
                  </button>

                  <p className="text-center text-sm text-slate-500">
                    Henüz hesabınız yok mu?{" "}
                    <Link
                      href="/register"
                      className="cursor-pointer font-bold text-slate-950 transition hover:text-cyan-700"
                    >
                      Kayıt ol
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