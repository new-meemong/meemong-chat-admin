import { MEEMONG_API_URL, WEBVIEW_API_KEY } from "@/constants/urls";
import { NextResponse } from "next/server";

interface WebviewLoginApiResponse {
  data?: {
    token?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

interface WebviewLoginRequest {
  userId?: unknown;
  webviewAPIKey?: unknown;
}

const DEFAULT_WEBVIEW_USER_ID = "56455";

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const parseResponseBody = async (response: Response) => {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as WebviewLoginApiResponse;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const requestBody = (await request.json().catch(() => null)) as
    | WebviewLoginRequest
    | null;
  const webviewAPIKey = getString(requestBody?.webviewAPIKey) || WEBVIEW_API_KEY;
  const userId = getString(requestBody?.userId) || DEFAULT_WEBVIEW_USER_ID;
  const apiUrl = process.env.MEEMONG_API_URL ?? MEEMONG_API_URL;

  if (!webviewAPIKey || !userId) {
    return NextResponse.json(
      {
        error: {
          code: "WEBVIEW_LOGIN_PARAMS_MISSING",
          message: "웹뷰 로그인 userId와 API 키가 필요합니다."
        }
      },
      { status: 400 }
    );
  }

  const response = await fetch(`${apiUrl}/api/v1/auth/webview-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      webviewAPIKey
    }),
    cache: "no-store"
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        error: {
          code: payload?.error?.code ?? "WEBVIEW_LOGIN_FAILED",
          message: payload?.error?.message ?? "웹뷰 로그인에 실패했습니다."
        }
      },
      { status: response.status }
    );
  }

  const token = payload?.data?.token;

  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "WEBVIEW_LOGIN_TOKEN_MISSING",
          message: "웹뷰 로그인 응답에 JWT가 없습니다."
        }
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    data: {
      token
    }
  });
}
