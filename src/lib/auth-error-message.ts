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

function hasStatus(error: unknown, status: number) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === status
  );
}

function getNormalizedErrorText(error: unknown) {
  return getErrorText(error).trim().toLowerCase();
}

export function isDuplicateAuthError(error: unknown) {
  const normalizedText = getNormalizedErrorText(error);

  return (
    normalizedText.includes("a user with this email address has already been registered") ||
    normalizedText.includes("user already registered") ||
    normalizedText.includes("user already exists") ||
    normalizedText.includes("email address already registered") ||
    normalizedText.includes("email already registered") ||
    normalizedText.includes("phone number already registered") ||
    normalizedText.includes("phone already registered") ||
    normalizedText.includes("phone number has already been registered")
  );
}

export function isInvalidCredentialsAuthError(error: unknown) {
  const normalizedText = getNormalizedErrorText(error);

  return (
    hasStatus(error, 401) ||
    normalizedText.includes("invalid login credentials") ||
    normalizedText.includes("invalid credentials") ||
    normalizedText.includes("invalid password") ||
    normalizedText.includes("email not confirmed") ||
    normalizedText.includes("invalid grant") ||
    normalizedText.includes("email, số điện thoại hoặc mật khẩu không đúng") ||
    normalizedText.includes("tài khoản không tồn tại")
  );
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

type AuthErrorContext = {
  identifierType?: "email" | "phone";
};

export function getAuthErrorMessage(
  error: unknown,
  fallback: string,
  context?: AuthErrorContext,
) {
  const errorCode = getErrorCode(error);
  const errorText = getErrorText(error).trim();
  const normalizedText = getNormalizedErrorText(error);

  if (hasStatus(error, 429)) {
    return "Hệ thống đang giới hạn tần suất đăng ký hoặc gửi email xác nhận. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (hasStatus(error, 401)) {
    return "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
  }

  if (hasStatus(error, 422)) {
    return "Dữ liệu gửi lên không hợp lệ.";
  }

  if (errorCode === "over_email_send_rate_limit") {
    return "Email xác nhận đang bị giới hạn tần suất gửi. Vui lòng đợi vài phút rồi thử lại.";
  }

  if (errorCode === "email_address_invalid") {
    return "Địa chỉ email không hợp lệ.";
  }

  if (errorCode === "otp_expired") {
    return "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.";
  }

  if (errorCode === "otp_disabled") {
    return "Tính năng OTP hiện không khả dụng. Vui lòng thử lại sau.";
  }

  if (isDuplicateAuthError(error)) {
    if (context?.identifierType === "phone") {
      return "Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.";
    }

    return "Email đã tồn tại. Vui lòng sử dụng email khác.";
  }

  if (isInvalidCredentialsAuthError(error)) {
    return "Email, số điện thoại hoặc mật khẩu không đúng.";
  }

  if (
    normalizedText.includes("user not found") ||
    normalizedText.includes("email not found") ||
    normalizedText.includes("no user found")
  ) {
    return "Tài khoản không tồn tại.";
  }

  if (
    normalizedText.includes("auth session missing") ||
    normalizedText.includes("refresh_token_not_found") ||
    normalizedText.includes("session not found")
  ) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  if (
    normalizedText.includes("user from sub claim in jwt does not exist") ||
    normalizedText.includes("jwt") && normalizedText.includes("does not exist")
  ) {
    return "Tài khoản đăng nhập không còn tồn tại. Vui lòng đăng nhập lại.";
  }

  if (
    normalizedText.includes("token has expired") ||
    normalizedText.includes("expired token") ||
    normalizedText.includes("expired otp")
  ) {
    return "Mã xác thực đã hết hạn. Vui lòng thử lại.";
  }

  if (
    normalizedText.includes("token is invalid") ||
    normalizedText.includes("invalid otp") ||
    normalizedText.includes("otp is invalid") ||
    normalizedText.includes("invalid token")
  ) {
    return "Mã xác thực không hợp lệ.";
  }

  if (
    normalizedText.includes("provider is not enabled") ||
    normalizedText.includes("unsupported provider")
  ) {
    return "Phương thức đăng nhập này hiện chưa được hỗ trợ.";
  }

  if (
    normalizedText.includes("oauth") ||
    normalizedText.includes("provider") && normalizedText.includes("callback")
  ) {
    return "Đăng nhập mạng xã hội chưa hoàn tất. Vui lòng thử lại.";
  }

  if (
    normalizedText.includes("error sending confirmation email") ||
    normalizedText.includes("error sending confirmation mail") ||
    normalizedText.includes("error sending email") ||
    normalizedText.includes("smtp")
  ) {
    return "Không gửi được email xác thực. Vui lòng thử lại sau.";
  }

  if (
    normalizedText.includes("database error saving new user") ||
    normalizedText.includes("database error") ||
    normalizedText.includes("permission denied")
  ) {
    return "Hệ thống đang gặp lỗi khi xử lý tài khoản. Vui lòng thử lại sau.";
  }

  if (
    normalizedText.includes("network") ||
    normalizedText.includes("fetch failed") ||
    normalizedText.includes("failed to fetch")
  ) {
    return "Không thể kết nối tới hệ thống. Vui lòng kiểm tra mạng và thử lại.";
  }

  if (errorText) {
    return fallback;
  }

  return fallback;
}
