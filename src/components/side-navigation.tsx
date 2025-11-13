"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import Link from "next/link";
import { Menu } from "lucide-react";

const SideNavigation = () => {
  return (
    <>
      {/* 모바일: 햄버거 + Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 rounded bg-white border shadow-md">
              <Menu className="w-6 h-6" />
              <span className="sr-only">메뉴 열기</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 max-w-full">
            <nav className="h-full bg-gray-100 p-4 border-r border-gray-200">
              <div className="mb-8">
                <h1 className="text-xl font-bold">미몽 채팅 어드민</h1>
              </div>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/latest-model-matching-chat-list"
                    className="block p-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    최근 모델 대화 목록(100개)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/daily-count"
                    className="block p-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    채팅방 데이터
                  </Link>
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      {/* 데스크탑: 기존 사이드바 */}
      <nav className="hidden md:fixed md:top-0 md:left-0 md:w-64 md:h-screen md:bg-gray-100 md:p-4 md:border-r md:border-gray-200 md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">미몽 채팅 어드민</h1>
        </div>
        <ul className="space-y-2">
          <li>
            <Link
              href="/latest-model-matching-chat-list"
              className="block p-2 rounded hover:bg-gray-200 transition-colors"
            >
              최근 모델 대화 목록(100개)
            </Link>
          </li>
          <li>
            <Link
              href="/daily-count"
              className="block p-2 rounded hover:bg-gray-200 transition-colors"
            >
              채팅방 데이터
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default SideNavigation;
