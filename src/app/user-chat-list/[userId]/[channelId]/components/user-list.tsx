"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";

import { User } from "@/types/user";
import { useRouter } from "next/navigation";

interface UserListProps {
  currentUser: User;
  otherUser: Partial<User>;
}

export default function UserList({ currentUser, otherUser }: UserListProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalName, setModalName] = useState<string | null>(null);
  const router = useRouter();

  // otherUser 타입 안전 분기
  function getOtherUserId(user: Partial<User>): number | undefined {
    if (typeof user.id === "number") return user.id;
    if (typeof (user as { UserID?: string }).UserID === "string") {
      const parsed = Number((user as { UserID: string }).UserID);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }
  function getOtherUserDisplayName(user: Partial<User>): string {
    if (typeof user.DisplayName === "string") return user.DisplayName;
    if (typeof (user as { UserID?: string }).UserID === "string")
      return (user as { UserID: string }).UserID;
    return "";
  }
  function getOtherUserRole(user: Partial<User>): number | undefined {
    if (typeof user.role === "number") return user.role;
    if (typeof (user as { Role?: number }).Role === "number")
      return (user as { Role: number }).Role;
    return undefined;
  }
  function getOtherUserCreatedAt(user: Partial<User>): string | undefined {
    if (typeof user.createdAt === "string") return user.createdAt;
    return undefined;
  }
  function getOtherUserProfileUrl(user: Partial<User>): string | undefined {
    if (typeof user.profileUrl === "string") return user.profileUrl;
    if (
      typeof (user as { ProfilePictureURL?: string }).ProfilePictureURL ===
      "string"
    )
      return (user as { ProfilePictureURL: string }).ProfilePictureURL;
    return undefined;
  }

  const users = [currentUser, otherUser];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">참여자 목록:</h2>
      <div className="flex flex-row space-x-4">
        {users.map((user, idx) => {
          // currentUser는 User, otherUser는 Partial<User>
          const isCurrent = idx === 0;
          const id = isCurrent ? user.id : getOtherUserId(user);
          const displayName = isCurrent
            ? user.DisplayName
            : getOtherUserDisplayName(user);
          const role = isCurrent ? user.role : getOtherUserRole(user);
          const createdAt = isCurrent
            ? user.createdAt
            : getOtherUserCreatedAt(user);
          const profileUrl = isCurrent
            ? user.profileUrl
            : getOtherUserProfileUrl(user);

          return (
            <div key={id} className="flex items-center space-x-2">
              <Avatar
                className="border-2 border-white shadow-sm size-12 md:size-20 cursor-pointer"
                onClick={() => {
                  if (profileUrl) {
                    if (window.innerWidth < 768) {
                      setModalImage(profileUrl);
                      setModalName(displayName || "프로필 이미지");
                    } else {
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.write(`
                          <html>
                            <head>
                              <title>${displayName || "프로필 이미지"}</title>
                              <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
                                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                              </style>
                            </head>
                            <body>
                              <img src="${profileUrl}" alt="${
                          displayName || "프로필 이미지"
                        }" />
                            </body>
                          </html>
                        `);
                      }
                    }
                  }
                }}
              >
                {profileUrl ? (
                  <AvatarImage
                    src={profileUrl}
                    alt={displayName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback></AvatarFallback>
              </Avatar>
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => id && router.push(`/user-chat-list/${id}`)}
              >
                <span
                  className={`text-[14px] md:text-[16px] break-words ${
                    role === 1
                      ? "text-blue-500"
                      : role === 2
                      ? "text-purple-500"
                      : "text-gray-700"
                  } text-left`}
                >
                  {displayName || "이름 없음"}
                </span>
                {/* 생성일 */}
                <span className="text-[14px] md:text-[16px] text-gray-500 max-w-[80px] truncate text-left">
                  {createdAt
                    ? (() => {
                        const d = new Date(createdAt);
                        return `${String(d.getFullYear()).slice(2)}.${String(
                          d.getMonth() + 1
                        ).padStart(2, "0")}.${String(d.getDate()).padStart(
                          2,
                          "0"
                        )}`;
                      })()
                    : ""}
                </span>
                {/* 아이디 */}
                <span className="block md:hidden text-[13px] text-gray-400 max-w-[80px] truncate text-left mt-0.5">
                  ({id})
                </span>
                <span className="hidden md:inline text-[14px] text-gray-400 ml-1 text-left">
                  ({id})
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-60 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setModalImage(null);
            }}
            aria-label="닫기"
          >
            ×
          </button>
          <img
            src={modalImage}
            alt={modalName || "프로필 이미지"}
            className="max-w-full max-h-[90vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
