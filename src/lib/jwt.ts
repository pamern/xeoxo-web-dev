import { SignJWT, jwtVerify } from "jose";

// Dùng "jose" thay vì "jsonwebtoken" vì jose chạy được trên Edge runtime
// (Next.js middleware chạy ở Edge, không có Node crypto đầy đủ).

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-doi-trong-env"
);

const EXPIRES_IN = "7d";

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
