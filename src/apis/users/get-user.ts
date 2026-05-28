import { apiFetch } from "../fetch";
import { User } from "@/types/user";

interface GetUserResponse {
  data?: User;
}

export const getUser = async (userId: number) => {
  const response = await apiFetch<GetUserResponse | null>(
    `/api/v1/users/${userId}`,
    "GET"
  );

  if (!response?.data) {
    throw new Error(`사용자 응답 데이터가 없습니다. userId=${userId}`);
  }

  return response.data;
};
