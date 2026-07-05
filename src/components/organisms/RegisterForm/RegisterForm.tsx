"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import { registerSchema } from "@/validations/auth/register.schema";

const inputClassName =
  "h-12 w-full rounded-pill border border-input bg-background px-6 text-base font-light text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";
const passwordHintMessage =
  "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

export type RegisterValues = {
  fullName: string;
  account: string;
  password: string;
  confirmPassword: string;
};

type RegisterField = keyof RegisterValues;

export function RegisterForm({
  onSubmit,
  isLoading,
  errorMessage,
  noticeMessage,
}: {
  onSubmit?: (values: RegisterValues) => void;
  isLoading?: boolean;
  errorMessage?: string;
  noticeMessage?: string;
}) {
  const [values, setValues] = useState<RegisterValues>({
    fullName: "",
    account: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<RegisterField, string>>
  >({});
  const [touched, setTouched] = useState<Record<RegisterField, boolean>>({
    fullName: false,
    account: false,
    password: false,
    confirmPassword: false,
  });

  function getFieldErrors(nextValues: RegisterValues) {
    const result = registerSchema.safeParse(nextValues);

    if (result.success) {
      return {};
    }

    return result.error.issues.reduce<Partial<Record<RegisterField, string>>>(
      (acc, issue) => {
        const field = issue.path[0];

        if (
          (field === "fullName" ||
            field === "account" ||
            field === "password" ||
            field === "confirmPassword") &&
          !acc[field]
        ) {
          acc[field] = issue.message;
        }

        return acc;
      },
      {},
    );
  }

  function update<K extends keyof RegisterValues>(
    key: K,
    value: RegisterValues[K],
  ) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);

    if (touched[key]) {
      setFieldErrors(getFieldErrors(nextValues));
    }
  }

  function handleBlur(field: RegisterField) {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setFieldErrors(getFieldErrors(values));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTouched = {
      fullName: true,
      account: true,
      password: true,
      confirmPassword: true,
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <input
            name="fullName"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            onBlur={() => handleBlur("fullName")}
            placeholder="Họ và tên"
            autoComplete="name"
            required
            disabled={isLoading}
            className={cn(
              inputClassName,
              touched.fullName && fieldErrors.fullName && "border-destructive",
            )}
          />
          {touched.fullName && fieldErrors.fullName ? (
            <p className="px-2 text-sm font-light text-destructive">
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>
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
            autoComplete="new-password"
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
        {fieldErrors.password ? (
          <p className="px-2 text-sm font-light text-foreground/58">
            {passwordHintMessage}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={values.confirmPassword}
            onChange={(event) => update("confirmPassword", event.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            required
            disabled={isLoading}
            className={cn(
              inputClassName,
              "pr-14",
              touched.confirmPassword &&
                fieldErrors.confirmPassword &&
                "border-destructive",
            )}
          />
          <PasswordToggle
            shown={showConfirm}
            onToggle={() => setShowConfirm((current) => !current)}
          />
        </div>
        {touched.confirmPassword && fieldErrors.confirmPassword ? (
          <p className="px-2 text-sm font-light text-destructive">
            {fieldErrors.confirmPassword}
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
        Đăng ký
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
