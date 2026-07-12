const STORAGE_PREFIX = "xeoxo:auth-login-guard:";
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000;

type StoredLoginAttempt = {
  failedAttempts: number;
  blockedUntil: number | null;
};

function canUseStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function getStorageKey(accountKey: string) {
  return `${STORAGE_PREFIX}${accountKey}`;
}

function readStoredState(accountKey: string): StoredLoginAttempt {
  if (!canUseStorage()) {
    return {
      failedAttempts: 0,
      blockedUntil: null,
    };
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(accountKey));
    if (!raw) {
      return {
        failedAttempts: 0,
        blockedUntil: null,
      };
    }

    const parsed = JSON.parse(raw) as Partial<StoredLoginAttempt>;
    return {
      failedAttempts:
        typeof parsed.failedAttempts === "number" ? parsed.failedAttempts : 0,
      blockedUntil:
        typeof parsed.blockedUntil === "number" ? parsed.blockedUntil : null,
    };
  } catch {
    return {
      failedAttempts: 0,
      blockedUntil: null,
    };
  }
}

function persistState(accountKey: string, state: StoredLoginAttempt) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(getStorageKey(accountKey), JSON.stringify(state));
}

function clearState(accountKey: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(getStorageKey(accountKey));
}

export function getLoginBlockRemainingMs(accountKey: string) {
  const state = readStoredState(accountKey);

  if (!state.blockedUntil) {
    return 0;
  }

  const remainingMs = state.blockedUntil - Date.now();

  if (remainingMs <= 0) {
    clearState(accountKey);
    return 0;
  }

  return remainingMs;
}

export function registerFailedLoginAttempt(accountKey: string) {
  const currentState = readStoredState(accountKey);
  const nextFailedAttempts = currentState.failedAttempts + 1;

  if (nextFailedAttempts >= MAX_FAILED_ATTEMPTS) {
    persistState(accountKey, {
      failedAttempts: nextFailedAttempts,
      blockedUntil: Date.now() + BLOCK_DURATION_MS,
    });

    return {
      isBlocked: true,
      remainingMs: BLOCK_DURATION_MS,
    };
  }

  persistState(accountKey, {
    failedAttempts: nextFailedAttempts,
    blockedUntil: null,
  });

  return {
    isBlocked: false,
    remainingMs: 0,
  };
}

export function resetFailedLoginAttempts(accountKey: string) {
  clearState(accountKey);
}

export function getLoginBlockedMessage() {
  return "Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 5 phút.";
}

