export const REQUIRED_APPOINTMENT_FIELDS = [
  "fullName",
  "phone",
  "email",
  "branch",
  "date",
  "timeSlot",
] as const;

export const APPOINTMENT_NOTE_MAX_WORDS = 200;

const INVALID_FULL_NAME_CONTENT = /<[^>]*>|script/i;
const FULL_NAME_ALLOWED_CHARS = /^[\p{L}\s-]+$/u;
export const VIETNAM_MOBILE_PHONE_REGEX =
  /^(?:03[2-9]|05[25689]|07[06789]|08[1-9]|09[0-46-9])\d{7}$/;
const EMAIL_BASIC_FORMAT =
  /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export function normalizeFullName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizePhone(value: string) {
  return value.trim();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateAppointmentFullName(value: string) {
  const text = normalizeFullName(value);

  if (!text) return "Vui lòng nhập họ và tên.";
  if (text.length < 2) return "Họ và tên phải có ít nhất 2 ký tự.";
  if (text.length > 100) return "Họ và tên không được vượt quá 100 ký tự.";
  if (/\p{N}/u.test(text)) return "Họ và tên không được chứa chữ số.";
  if (INVALID_FULL_NAME_CONTENT.test(text)) {
    return "Họ và tên chứa ký tự không hợp lệ.";
  }
  if (!FULL_NAME_ALLOWED_CHARS.test(text)) {
    return "Họ và tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch nối (-).";
  }

  return undefined;
}

export function validateAppointmentPhone(value: string) {
  const text = normalizePhone(value);

  if (!text) return "Vui lòng nhập số điện thoại.";
  if (text.startsWith("+84")) {
    return "Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số.";
  }
  if (!/^\d+$/.test(text)) return "Số điện thoại chỉ được chứa chữ số.";
  if (text.length !== 10) return "Số điện thoại phải gồm đúng 10 chữ số.";
  if (/^(\d)\1{9}$/.test(text)) return "Số điện thoại không hợp lệ.";
  if (!text.startsWith("0")) return "Số điện thoại phải bắt đầu bằng số 0.";
  if (!VIETNAM_MOBILE_PHONE_REGEX.test(text)) {
    return "Đầu số điện thoại không hợp lệ.";
  }

  return undefined;
}

export function validateAppointmentEmail(value: string) {
  const text = normalizeEmail(value);

  if (!text) return "Vui lòng nhập email cá nhân.";
  if (text.length > 254) return "Email không được vượt quá 254 ký tự.";
  if (/\s/.test(text)) return "Email không được chứa khoảng trắng.";
  if (text.includes("..")) return "Email không được chứa hai dấu chấm liên tiếp.";
  if (!EMAIL_BASIC_FORMAT.test(text)) {
    return "Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.";
  }

  return undefined;
}

export function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function validateAppointmentNote(value: string) {
  if (countWords(value) > APPOINTMENT_NOTE_MAX_WORDS) {
    return `Ghi chú không được vượt quá ${APPOINTMENT_NOTE_MAX_WORDS} từ.`;
  }

  return undefined;
}
