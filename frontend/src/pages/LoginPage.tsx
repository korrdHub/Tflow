import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { anonymousLogin } = useAuthStore();

  const handleAnonymous = async () => {
    await anonymousLogin();
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-2 text-3xl font-bold">严师APP</h1>
      <p className="mb-6 text-gray-600">写计划 = 立军令状</p>
      <button
        onClick={handleAnonymous}
        className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
      >
        匿名体验
      </button>
    </div>
  );
}
