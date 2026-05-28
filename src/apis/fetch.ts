import { MEEMONG_API_URL } from "@/constants/urls";
import {
  clearStoredAuthToken,
  getAuthToken
} from "@/apis/auth/token";
import {
  loginWithWebview,
  WebviewLoginError
} from "@/apis/auth/webview-login";

interface ApiFetchErrorOptions {
  message: string;
  status: number;
  code?: string;
  payload?: unknown;
}

export class ApiFetchError extends Error {
  status: number;
  code?: string;
  payload?: unknown;

  constructor({ message, status, code, payload }: ApiFetchErrorOptions) {
    super(message);
    this.name = "ApiFetchError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

const AUTH_ERROR_CODES = new Set([
  "AUTH_TOKEN_MISSING",
  "TOKEN_EXPIRED",
  "INVALID_TOKEN",
  "UNAUTHORIZED"
]);
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getApiErrorCode = (payload: unknown) => {
  if (!isRecord(payload)) return undefined;

  if (typeof payload.code === "string") return payload.code;

  if (isRecord(payload.error) && typeof payload.error.code === "string") {
    return payload.error.code;
  }

  return undefined;
};

const getApiErrorMessage = (payload: unknown) => {
  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return undefined;

  if (typeof payload.toastMessage === "string") return payload.toastMessage;
  if (typeof payload.message === "string") return payload.message;

  if (isRecord(payload.error) && typeof payload.error.message === "string") {
    return payload.error.message;
  }

  return undefined;
};

const getErrorMessage = (status: number, payload: unknown) => {
  const code = getApiErrorCode(payload);

  if (code === "TOKEN_EXPIRED") {
    return "API 인증 토큰이 만료되었고 웹뷰 로그인 재시도 후에도 갱신되지 않았습니다.";
  }

  return getApiErrorMessage(payload) ?? `API 요청에 실패했습니다. (${status})`;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();

  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const isAuthTokenError = (error: unknown): error is ApiFetchError =>
  error instanceof ApiFetchError &&
  (AUTH_ERROR_CODES.has(error.code ?? "") ||
    error.status === 401 ||
    error.status === 403);

const shouldRefreshAuthToken = (status: number, code?: string) =>
  status === 401 || status === 403 || AUTH_ERROR_CODES.has(code ?? "");

export const apiFetch = async <T = unknown>(
  url: string,
  method: string,
  body?: unknown
): Promise<T> => {
  const fullUrl = MEEMONG_API_URL + url;

  if (IS_DEVELOPMENT) {
    console.log("[apiFetch] request", method, fullUrl);
  }

  try {
    let authToken = getAuthToken();

    if (!authToken) {
      authToken = await loginWithWebview();
    }

    const fetchWithAuthToken = async (nextAuthToken: string) => {
      const requestInit: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: nextAuthToken
        }
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      const response = await fetch(fullUrl, requestInit);
      const responseData = await parseResponseBody(response);

      return { response, responseData };
    };

    let { response, responseData } = await fetchWithAuthToken(authToken);

    if (
      !response.ok &&
      shouldRefreshAuthToken(response.status, getApiErrorCode(responseData))
    ) {
      clearStoredAuthToken();
      authToken = await loginWithWebview();
      ({ response, responseData } = await fetchWithAuthToken(authToken));
    }

    if (!response.ok) {
      const nextCode = getApiErrorCode(responseData);
      const message = getErrorMessage(response.status, responseData);

      console.error("[apiFetch] error", {
        status: response.status,
        code: nextCode,
        message,
        url: fullUrl
      });

      throw new ApiFetchError({
        message,
        status: response.status,
        code: nextCode,
        payload: responseData
      });
    }

    if (IS_DEVELOPMENT) {
      console.log("[apiFetch] response", response.status, fullUrl);
    }

    return responseData as T;
  } catch (e) {
    if (e instanceof ApiFetchError) {
      throw e;
    }

    const message =
      e instanceof Error
        ? e.message
        : "API 요청 중 네트워크 오류가 발생했습니다.";

    console.error("[apiFetch] failed", e);
    throw new ApiFetchError({
      message,
      status: 0,
      code: e instanceof WebviewLoginError ? "AUTH_TOKEN_MISSING" : undefined,
      payload: e
    });
  }
};
