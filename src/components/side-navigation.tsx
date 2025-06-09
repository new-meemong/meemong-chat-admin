import Link from "next/link";

const SideNavigation = () => {
  return (
    <nav className="fixed top-0 left-0 w-64 h-screen bg-gray-100 p-4 border-r border-gray-200">
      <div className="mb-8">
        <h1 className="text-xl font-bold">미몽 채팅 어드민</h1>
      </div>
      <ul className="space-y-2">
        <li>
          <Link
            href="/latest-chat-list"
            className="block p-2 rounded hover:bg-gray-200 transition-colors"
          >
            최근 대화 목록(100개)
          </Link>
        </li>
        <li>
          <Link
            href="/users"
            className="block p-2 rounded hover:bg-gray-200 transition-colors"
          >
            채팅 데이터
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SideNavigation;
