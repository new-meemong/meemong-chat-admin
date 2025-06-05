import { PRODUCTION_API, jwt } from "@/constants/urls";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiFetch = async (url: string, method: string, body?: any) => {
  const fullUrl = PRODUCTION_API + url;
  // const jwt = useAuthStore.getState().jwt;

  console.log("=== API Request ===");
  console.log(method, fullUrl, {
    "Content-Type": "application/json",
    Authorization: `${jwt}`
  });
  // console.log("Method:", method);
  // console.log("Headers:", {
  //   "Content-Type": "application/json",
  //   Authorization: `${jwt}`
  // });
  if (body) {
    console.log("Body:", JSON.stringify(body, null, 2));
  }
  console.log("====================");

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `${jwt}`
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error("API fetch failed");
    }
    const responseData = await response.json();
    console.log("=== API Response ===");
    console.log(response.status, response.statusText, fullUrl);
    // console.log("Status:", response.status);
    // console.log("Status Text:", response.statusText);
    console.log("Data:", responseData);
    console.log("====================");

    return responseData;
  } catch (e) {
    console.error("[apiFetch] failed", e);
    throw new Error("API fetch failed");
  }
};
