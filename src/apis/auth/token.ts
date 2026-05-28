const AUTH_TOKEN_STORAGE_KEY = "meemong-chat-admin-auth-token";

const canUseLocalStorage = () => typeof window !== "undefined";

export const normalizeAuthToken = (token: string) => {
  const trimmedToken = token.trim();

  if (!trimmedToken) return "";

  return /^JWT\s+/i.test(trimmedToken)
    ? trimmedToken
    : `JWT ${trimmedToken}`;
};

export const getStoredAuthToken = () => {
  if (!canUseLocalStorage()) return null;

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!token?.trim()) return null;

  return normalizeAuthToken(token);
};

export const setStoredAuthToken = (token: string) => {
  if (!canUseLocalStorage()) return;

  const normalizedToken = normalizeAuthToken(token);

  if (!normalizedToken) {
    clearStoredAuthToken();
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken);
};

export const clearStoredAuthToken = () => {
  if (!canUseLocalStorage()) return;

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

export const getAuthToken = () => getStoredAuthToken();
