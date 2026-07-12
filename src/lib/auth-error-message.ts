function getErrorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

function getErrorText(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const errorCode = getErrorCode(error);
  const errorText = getErrorText(error).trim();
  const normalizedText = errorText.toLowerCase();

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 429
  ) {
    return "Hệ thống đang giới hạn tần suất đăng ký hoặc gửi email xác nhận. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (errorCode === "over_email_send_rate_limit") {
    return "Email xác nhận đang bị giới hạn tần suất gửi. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (
    normalizedText.includes("user already registered") ||
    normalizedText.includes("user already exists")
  ) {
    return "Email đã tồn tại. Vui lòng sử dụng email khác.";
  }

  if (
    normalizedText.includes("phone number already registered") ||
    normalizedText.includes("phone already registered") ||
    normalizedText.includes("phone number has already been registered")
  ) {
    return "Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.";
  }

  if (
    normalizedText.includes("error sending confirmation email") ||
    normalizedText.includes("error sending confirmation mail") ||
    normalizedText.includes("error sending email") ||
    normalizedText.includes("smtp")
  ) {
    return "Không gửi được email xác thực. Vui lòng thử lại sau.";
  }

  if (errorText) {
    return errorText;
  }

  return fallback;
}
