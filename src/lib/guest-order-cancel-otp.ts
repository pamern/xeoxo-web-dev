import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-doi-trong-env",
);

const GUEST_CANCEL_COOKIE = "guest_order_cancel_otp";
const GUEST_CANCEL_TTL_SECONDS = 10 * 60;

type GuestOrderCancelOtpPayload = {
  purpose: "cancel-order";
  orderCode: string;
  orderId: number;
  contact: string;
};

async function signGuestOrderCancelOtpToken(
  payload: GuestOrderCancelOtpPayload,
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${GUEST_CANCEL_TTL_SECONDS}s`)
    .sign(secret);
}

async function verifyGuestOrderCancelOtpToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as GuestOrderCancelOtpPayload;
  } catch {
    return null;
  }
}

export async function setGuestOrderCancelOtpCookie(
  payload: GuestOrderCancelOtpPayload,
) {
  const token = await signGuestOrderCancelOtpToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(GUEST_CANCEL_COOKIE, token, {
    httpOnly: true,
    maxAge: GUEST_CANCEL_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function hasVerifiedGuestOrderCancelOtp(
  payload: GuestOrderCancelOtpPayload,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_CANCEL_COOKIE)?.value;

  if (!token) {
    return false;
  }

  const verifiedPayload = await verifyGuestOrderCancelOtpToken(token);

  return Boolean(
    verifiedPayload &&
      verifiedPayload.purpose === payload.purpose &&
      verifiedPayload.orderCode === payload.orderCode &&
      verifiedPayload.orderId === payload.orderId &&
      verifiedPayload.contact === payload.contact,
  );
}

export async function clearGuestOrderCancelOtpCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_CANCEL_COOKIE);
}
