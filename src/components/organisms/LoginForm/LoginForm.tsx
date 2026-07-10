"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { loginSchema } from "@/validations/auth/login.schema";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 w-full rounded-pill border border-input bg-background px-6 text-base font-light text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

type LoginValues = {
  account: string;
  password: string;
};

type LoginField = keyof LoginValues;

export function LoginForm({
  onSubmit,
  isLoading,
  errorMessage,
  noticeMessage,
}: {
  onSubmit?: (values: LoginValues) => void;
  isLoading?: boolean;
  errorMessage?: string;
  noticeMessage?: string;
}) {
  const [values, setValues] = useState<LoginValues>({
    account: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<LoginField, string>>
  >({});
  const [touched, setTouched] = useState<Record<LoginField, boolean>>({
    account: false,
    password: false,
  });

  function getFieldErrors(nextValues: LoginValues) {
    const result = loginSchema.safeParse(nextValues);

    if (result.success) {
      return {};
    }

    return result.error.issues.reduce<Partial<Record<LoginField, string>>>(
      (acc, issue) => {
        const field = issue.path[0];

        if ((field === "account" || field === "password") && !acc[field]) {
          acc[field] = issue.message;
        }

        return acc;
      },
      {},
    );
  }

  function update<K extends LoginField>(key: K, value: LoginValues[K]) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);

    if (touched[key]) {
      setFieldErrors(getFieldErrors(nextValues));
    }
  }

  function handleBlur(field: LoginField) {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setFieldErrors(getFieldErrors(values));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTouched = {
      account: true,
      password: true,
    };
    const nextErrors = getFieldErrors(values);

    setTouched(nextTouched);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit?.(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <input
          name="account"
          value={values.account}
          onChange={(event) => update("account", event.target.value)}
          onBlur={() => handleBlur("account")}
          placeholder="Email hoặc số điện thoại"
          autoComplete="username"
          required
          disabled={isLoading}
          className={cn(
            inputClassName,
            touched.account && fieldErrors.account && "border-destructive",
          )}
        />
        {touched.account && fieldErrors.account ? (
          <p className="px-2 text-sm font-light text-destructive">
            {fieldErrors.account}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            required
            disabled={isLoading}
            className={cn(
              inputClassName,
              "pr-14",
              touched.password && fieldErrors.password && "border-destructive",
            )}
          />
          <PasswordToggle
            shown={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
          />
        </div>
        {touched.password && fieldErrors.password ? (
          <p className="px-2 text-sm font-light text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {errorMessage && (
        <p className="text-sm font-light text-destructive">{errorMessage}</p>
      )}
      {noticeMessage && !errorMessage && (
        <p className="text-sm font-light text-foreground/70">{noticeMessage}</p>
      )}

      <Button
        type="submit"
        size="lg"
        isLoading={isLoading}
        className="mt-1 h-[54px] w-full rounded-pill border-2 border-white/50 text-lg font-bold"
      >
        Đăng nhập
      </Button>
    </form>
  );
}

function PasswordToggle({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      className="absolute right-5 top-1/2 -translate-y-1/2 opacity-60 transition-opacity hover:opacity-100"
    >
      <Image src="/icons/eye.svg" alt="" width={22} height={22} aria-hidden />
    </button>
  );
}
