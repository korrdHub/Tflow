import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { anonymousLogin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnonymous = async () => {
    setLoading(true);
    setError(null);
    try {
      await anonymousLogin();
      navigate("/dashboard");
    } catch (e) {
      setError("登录失败，请检查网络连接");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-2 text-3xl font-bold">严师APP</h1>
      <p className="mb-6 text-gray-600">写计划 = 立军令状</p>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <button
        onClick={handleAnonymous}
        disabled={loading}
        className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "登录中..." : "匿名体验"}
      </button>
    </div>
  );
}
