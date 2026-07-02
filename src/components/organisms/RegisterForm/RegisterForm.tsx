"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 w-full rounded-pill border border-input bg-background px-6 text-base font-light text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export type RegisterValues = {
  fullName: string;
  account: string;
  password: string;
  confirmPassword: string;
};

export function RegisterForm({
  onSubmit,
}: {
  onSubmit?: (values: RegisterValues) => void;
}) {
  const [values, setValues] = useState<RegisterValues>({
    fullName: "",
    account: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string>();

  function update<K extends keyof RegisterValues>(key: K, value: RegisterValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (values.password !== values.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    setError(undefined);
    onSubmit?.(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="fullName"
          value={values.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          placeholder="Họ và tên"
          autoComplete="name"
          required
          className={inputClassName}
        />
        <input
          name="account"
          value={values.account}
          onChange={(event) => update("account", event.target.value)}
          placeholder="Email/SĐT của bạn"
          autoComplete="username"
          required
          className={inputClassName}
        />
      </div>

      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="Mật khẩu"
          autoComplete="new-password"
          required
          className={cn(inputClassName, "pr-14")}
        />
        <PasswordToggle
          shown={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
      </div>

      <div className="relative">
        <input
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          value={values.confirmPassword}
          onChange={(event) => update("confirmPassword", event.target.value)}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          required
          className={cn(inputClassName, "pr-14")}
        />
        <PasswordToggle
          shown={showConfirm}
          onToggle={() => setShowConfirm((current) => !current)}
        />
      </div>

      {error && <p className="text-sm font-light text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="mt-1 h-12 w-full rounded-pill text-lg font-bold">
        Đăng ký
      </Button>
    </form>
  );
}

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
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
