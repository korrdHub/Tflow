import { Outlet, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function Layout() {
  const { logout } = useAuthStore();
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white p-4 shadow">
        <div className="space-x-4">
          <Link to="/dashboard" className="font-medium text-blue-600">仪表盘</Link>
          <Link to="/plans" className="font-medium text-blue-600">计划管理</Link>
        </div>
        <button onClick={logout} className="text-sm text-gray-600">退出</button>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
