"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { User } from "@/types/user";

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
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
                  const win = window.open("", "_blank");
                  if (win) {
                    win.document.write(`
                      <html>
                        <head>
                          <title>${user.DisplayName || "프로필 이미지"}</title>
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
    </div>
  );
}
