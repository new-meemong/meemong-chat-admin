"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useState } from "react";

import { User } from "@/types/user";

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalName, setModalName] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">참여자 목록:</h2>
      <div
        className={
          users.length === 2
            ? "flex flex-row space-x-4"
            : "space-y-2 flex flex-col"
        }
      >
        {users.map((user) => (
          <div key={user.id} className="flex items-center space-x-2">
            <Avatar
              className="border-2 border-white shadow-sm size-12 md:size-20 cursor-pointer"
              onClick={() => {
                if (user.profileUrl) {
                  if (window.innerWidth < 768) {
                    // 모바일: 모달로 띄움
                    setModalImage(user.profileUrl);
                    setModalName(user.DisplayName || "프로필 이미지");
                  } else {
                    // PC: 새 탭으로 띄움
                    const win = window.open("", "_blank");
                    if (win) {
                      win.document.write(`
                        <html>
                          <head>
                            <title>${
                              user.DisplayName || "프로필 이미지"
                            }</title>
                            <style>
                              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
                              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                            </style>
                          </head>
                          <body>
                            <img src="${user.profileUrl}" alt="${
                        user.DisplayName || "프로필 이미지"
                      }" />
                          </body>
                        </html>
                      `);
                    }
                  }
                }
              }}
            >
              {user.profileUrl ? (
                <AvatarImage
                  src={user.profileUrl}
                  alt={user.DisplayName}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback></AvatarFallback>
            </Avatar>

            <span
              className={`text-[14px] md:text-[16px] break-words ${
                user.role === 1
                  ? "text-blue-500"
                  : user.role === 2
                  ? "text-purple-500"
                  : "text-gray-700"
              }`}
            >
              {user.DisplayName || "이름 없음"}
            </span>
            <span className="text-[14px] md:text-[16px] text-gray-500 max-w-[80px] truncate text-center">
              ({user.id})
            </span>
          </div>
        ))}
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
