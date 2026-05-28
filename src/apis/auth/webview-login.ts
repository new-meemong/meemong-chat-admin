import { setStoredAuthToken } from "./token";

const WEBVIEW_API_KEY_STORAGE_KEY = "meemong-chat-admin-webview-api-key";
const WEBVIEW_USER_ID_STORAGE_KEY = "meemong-chat-admin-webview-user-id";
const DEFAULT_WEBVIEW_USER_ID = "56455";

interface WebviewLoginResponse {
  data?: {
    token?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

interface WebviewLoginCredentials {
  userId?: string;
  webviewAPIKey: string;
}

let loginPromise: Promise<string> | null = null;

export class WebviewLoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebviewLoginError";
  }
}

const getWebviewLoginErrorMessage = (payload: WebviewLoginResponse | null) =>
  payload?.error?.message ?? "웹뷰 로그인에 실패했습니다.";

const getStoredWebviewLoginCredentials = (): WebviewLoginCredentials | null => {
  if (typeof window === "undefined") {
    throw new WebviewLoginError("웹뷰 로그인은 브라우저에서만 실행할 수 있습니다.");
  }

  const webviewAPIKey = window.sessionStorage
    .getItem(WEBVIEW_API_KEY_STORAGE_KEY)
    ?.trim();
  const userId = window.sessionStorage
    .getItem(WEBVIEW_USER_ID_STORAGE_KEY)
    ?.trim();

  if (!webviewAPIKey || !userId) return null;

  return {
    userId,
    webviewAPIKey
  };
};

const promptWebviewLoginCredentials = (): WebviewLoginCredentials => {
  if (typeof window === "undefined") {
    throw new WebviewLoginError("웹뷰 로그인은 브라우저에서만 실행할 수 있습니다.");
  }

  const webviewAPIKey =
    window.prompt("웹뷰 API 키를 입력하세요.")?.trim() ?? "";

  if (!webviewAPIKey) {
    throw new WebviewLoginError("웹뷰 API 키가 필요합니다.");
  }

  window.sessionStorage.setItem(WEBVIEW_API_KEY_STORAGE_KEY, webviewAPIKey);

  const userId =
    window
      .prompt("웹뷰 로그인 userId를 입력하세요.", DEFAULT_WEBVIEW_USER_ID)
      ?.trim() ?? "";

  if (!userId) {
    throw new WebviewLoginError("웹뷰 로그인 userId가 필요합니다.");
  }

  window.sessionStorage.setItem(WEBVIEW_USER_ID_STORAGE_KEY, userId);

  return {
    userId,
    webviewAPIKey
  };
};

const requestWebviewLoginWithCredentials = async (
  credentials: WebviewLoginCredentials | null
) => {
  const response = await fetch("/api/auth/webview-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials ?? {})
  });

  const payload = (await response
    .json()
    .catch(() => null)) as WebviewLoginResponse | null;

  return { response, payload };
};

const persistWebviewLoginToken = (payload: WebviewLoginResponse | null) => {
  const token = payload?.data?.token;
  if (!token) throw new WebviewLoginError("웹뷰 로그인 응답에 JWT가 없습니다.");
  setStoredAuthToken(token);
  return token;
};

const requestWebviewLogin = async () => {
  let { response, payload } = await requestWebviewLoginWithCredentials(
    getStoredWebviewLoginCredentials()
  );

  if (response.ok) {
    return persistWebviewLoginToken(payload);
  }

  if (payload?.error?.code === "WEBVIEW_LOGIN_PARAMS_MISSING") {
    ({ response, payload } = await requestWebviewLoginWithCredentials(
      promptWebviewLoginCredentials()
    ));

    if (response.ok) {
      return persistWebviewLoginToken(payload);
    }
  }

  throw new WebviewLoginError(getWebviewLoginErrorMessage(payload));
};

export const loginWithWebview = () => {
  if (!loginPromise) {
    loginPromise = requestWebviewLogin().finally(() => {
      loginPromise = null;
    });
  }

  return loginPromise;
};
