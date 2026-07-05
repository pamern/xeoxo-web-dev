"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 w-full rounded-pill border border-input bg-background px-6 text-base font-light text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

export function LoginForm({
  onSubmit,
  isLoading,
  errorMessage,
  noticeMessage,
}: {
  onSubmit?: (values: { account: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
  noticeMessage?: string;
}) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.({ account, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="account"
        value={account}
        onChange={(event) => setAccount(event.target.value)}
        placeholder="Email của bạn"
        autoComplete="username"
        required
        disabled={isLoading}
        className={inputClassName}
      />

      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mật khẩu"
          autoComplete="current-password"
          required
          disabled={isLoading}
          className={cn(inputClassName, "pr-14")}
        />
        <PasswordToggle
          shown={showPassword}
          onToggle={() => setShowPassword((current) => !current)}
        />
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
