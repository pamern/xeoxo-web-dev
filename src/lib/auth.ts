import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signToken, verifyToken, type JwtPayload } from "./jwt";

// Tên cookie lưu token. httpOnly để JS phía client không đọc được -> chống XSS.
export const AUTH_COOKIE = "auth_token";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// Set cookie sau khi login/signup thành công.
export async function setAuthCookie(payload: JwtPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

// Lấy user hiện tại từ cookie (dùng trong Server Component / API route).
export async function getCurrentUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
