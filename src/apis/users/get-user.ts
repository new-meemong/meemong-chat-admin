import { apiFetch } from "../fetch";

export const getUser = async (userId: string) => {
  try {
    const response = await apiFetch(`/api/v1/users/${userId}`, "GET");
    return response.data;
  } catch (error) {
    console.error("[getUser] error", error);
    throw error;
  }
};
