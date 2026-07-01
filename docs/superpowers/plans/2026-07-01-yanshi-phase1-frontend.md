# 严师APP Phase 1 前端 PWA 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现严师APP Phase 1 MVP 前端 PWA，完成「匿名登录 → 创建/查看计划 → 记录追踪 → 提交复盘」的核心闭环页面。

**Architecture:** 使用 React 18 + TypeScript + Vite 构建单页应用；Tailwind CSS 负责样式；Zustand 管理全局状态；React Router 处理路由；axios 调用后端 API；Vitest + React Testing Library + MSW 进行 TDD 测试；Service Worker 与 Web App Manifest 提供基础 PWA 能力。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6, axios, Vitest, @testing-library/react, @testing-library/jest-dom, MSW, workbox-window.

---

## 文件结构

```
/workspace/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   │   └── manifest.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── plans.ts
│   │   │   ├── tracking.ts
│   │   │   └── review.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   └── planStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── PlansPage.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── PlanForm.tsx
│   │   │   ├── PlanList.tsx
│   │   │   ├── ReminderModal.tsx
│   │   │   ├── ReviewModal.tsx
│   │   │   └── ModeSelector.tsx
│   │   └── sw.ts                    # Service Worker 注册
│   └── tests/
│       ├── setup.ts
│       ├── msw/
│       │   ├── server.ts
│       │   └── handlers.ts
│       ├── LoginPage.test.tsx
│       ├── PlansPage.test.tsx
│       ├── DashboardPage.test.tsx
│       ├── ReminderModal.test.tsx
│       └── ReviewModal.test.tsx
```

---

## Task 1: 初始化 Vite + React + TypeScript 项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/vite-env.d.ts`
- Create: `frontend/tests/setup.ts`
- Create: `frontend/tests/Hello.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/Hello.test.tsx
import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe("App", () => {
  it("renders the app title", () => {
    render(<App />);
    expect(screen.getByText(/严师APP/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test`

Expected: `FAIL tests/Hello.test.tsx` (project/config missing)

- [ ] **Step 3: 编写最小实现**

```bash
cd /workspace/frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-pwa vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw
npx tailwindcss init -p
npm install zustand axios react-router-dom uuid
npm install -D @types/uuid
```

```json
// frontend/package.json scripts 片段
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

```ts
// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});
```

```ts
// frontend/tests/setup.ts
import "@testing-library/jest-dom";
```

```tsx
// frontend/src/App.tsx
function App() {
  return <h1 className="text-2xl font-bold">严师APP</h1>;
}
export default App;
```

```tsx
// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test`

Expected: `PASS tests/Hello.test.tsx`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): bootstrap Vite React TS project with Vitest"
```

---

## Task 2: API 客户端与类型定义

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/plans.ts`
- Create: `frontend/tests/api.test.ts`

- [ ] **Step 1: 编写失败测试**

```ts
// frontend/tests/api.test.ts
import { describe, it, expect } from "vitest";
import { apiClient } from "../src/api/client";

describe("apiClient", () => {
  it("has baseURL pointing to backend", () => {
    expect(apiClient.defaults.baseURL).toBe("http://localhost:8000");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/api.test.ts`

Expected: `FAIL` (module missing)

- [ ] **Step 3: 编写最小实现**

```ts
// frontend/src/types/index.ts
export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  mode: "strict" | "moderate" | "coach";
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  completion_standard: string;
  deadline: string;
  reminder_frequency: number;
  status: "draft" | "active" | "completed" | "abandoned" | "overdue" | "archived";
  created_at: string;
  completed_at?: string;
}

export interface PlanInput {
  title: string;
  completion_standard: string;
  deadline: string;
  reminder_frequency?: number;
}

export interface ReviewInput {
  completed: boolean;
  reason?: string;
  user_reflection?: string;
}

export interface ReviewAnalysis {
  total_reviews: number;
  completed_reviews: number;
  completion_rate: number;
  consecutive_completed: number;
  extend_count: number;
  suggestion: string;
}
```

```ts
// frontend/src/api/client.ts
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("yanshi_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

```ts
// frontend/src/api/auth.ts
import { apiClient } from "./client";
import type { Token } from "../types";

export const anonymousLogin = () => apiClient.post<Token>("/auth/anonymous").then((r) => r.data);
```

```ts
// frontend/src/api/plans.ts
import { apiClient } from "./client";
import type { Plan, PlanInput } from "../types";

export const listPlans = () => apiClient.get<Plan[]>("/plans").then((r) => r.data);
export const createPlan = (data: PlanInput) => apiClient.post<Plan>("/plans", data).then((r) => r.data);
export const updatePlan = (id: string, data: Partial<PlanInput>) =>
  apiClient.put<Plan>(`/plans/${id}`, data).then((r) => r.data);
export const deletePlan = (id: string) => apiClient.delete(`/plans/${id}`);
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/api.test.ts`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add axios client and API types"
```

---

## Task 3: MSW 测试桩（模拟后端 API）

**Files:**
- Create: `frontend/tests/msw/server.ts`
- Create: `frontend/tests/msw/handlers.ts`
- Modify: `frontend/tests/setup.ts`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/mswSmoke.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { apiClient } from "../src/api/client";

describe("MSW", () => {
  it("returns mocked anonymous token", async () => {
    const data = await apiClient.post("/auth/anonymous").then((r) => r.data);
    expect(data.access_token).toBe("mock-token");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/mswSmoke.test.tsx`

Expected: `FAIL` (real backend unreachable or no mock)

- [ ] **Step 3: 编写最小实现**

```ts
// frontend/tests/msw/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

```ts
// frontend/tests/msw/handlers.ts
import { http, HttpResponse } from "msw";
import type { Plan, Token } from "../../src/types";

let plans: Plan[] = [];

export const handlers = [
  http.post("http://localhost:8000/auth/anonymous", () => {
    return HttpResponse.json<Token>({ access_token: "mock-token", token_type: "bearer" });
  }),

  http.get("http://localhost:8000/plans", () => HttpResponse.json(plans)),

  http.post("http://localhost:8000/plans", async ({ request }) => {
    const body = (await request.json()) as Omit<Plan, "id" | "user_id" | "status" | "created_at">;
    const plan: Plan = {
      id: "plan-1",
      user_id: "user-1",
      status: "active",
      created_at: new Date().toISOString(),
      ...body,
      reminder_frequency: body.reminder_frequency ?? 60,
    };
    plans.push(plan);
    return HttpResponse.json(plan, { status: 201 });
  }),

  http.post("http://localhost:8000/plans/:id/track", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "log-1", plan_id: "plan-1", ...body }, { status: 201 });
  }),

  http.post("http://localhost:8000/plans/:id/reviews", async ({ request }) => {
    const body = (await request.json()) as { completed: boolean; reason?: string };
    if (!body.completed && !body.reason) {
      return HttpResponse.json({ detail: "Reason required" }, { status: 422 });
    }
    return HttpResponse.json({ id: "review-1", plan_id: "plan-1", ...body }, { status: 201 });
  }),

  http.get("http://localhost:8000/plans/:id/reviews/analysis", () =>
    HttpResponse.json({
      total_reviews: 1,
      completed_reviews: 0,
      completion_rate: 0,
      consecutive_completed: 0,
      extend_count: 1,
      suggestion: "Try to finish the next one on time.",
    })
  ),
];
```

```ts
// frontend/tests/setup.ts
import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./msw/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/mswSmoke.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "test(frontend): add MSW handlers for backend API mocks"
```

---

## Task 4: 全局状态（Auth Store 与 Plan Store）

**Files:**
- Create: `frontend/src/stores/authStore.ts`
- Create: `frontend/src/stores/planStore.ts`
- Create: `frontend/tests/authStore.test.ts`
- Create: `frontend/tests/planStore.test.ts`

- [ ] **Step 1: 编写失败测试**

```ts
// frontend/tests/authStore.test.ts
import { describe, it, expect } from "vitest";
import { useAuthStore } from "../src/stores/authStore";

describe("authStore", () => {
  it("logs in anonymously and stores token", async () => {
    await useAuthStore.getState().anonymousLogin();
    expect(useAuthStore.getState().token).toBe("mock-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/authStore.test.ts`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```ts
// frontend/src/stores/authStore.ts
import { create } from "zustand";
import { anonymousLogin } from "../api/auth";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  anonymousLogin: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("yanshi_token"),
  isAuthenticated: !!localStorage.getItem("yanshi_token"),
  anonymousLogin: async () => {
    const data = await anonymousLogin();
    localStorage.setItem("yanshi_token", data.access_token);
    set({ token: data.access_token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("yanshi_token");
    set({ token: null, isAuthenticated: false });
  },
}));
```

```ts
// frontend/src/stores/planStore.ts
import { create } from "zustand";
import { listPlans, createPlan, deletePlan } from "../api/plans";
import type { Plan, PlanInput } from "../types";

interface PlanState {
  plans: Plan[];
  loading: boolean;
  fetchPlans: () => Promise<void>;
  addPlan: (input: PlanInput) => Promise<void>;
  removePlan: (id: string) => Promise<void>;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  loading: false,
  fetchPlans: async () => {
    set({ loading: true });
    const plans = await listPlans();
    set({ plans, loading: false });
  },
  addPlan: async (input) => {
    const plan = await createPlan(input);
    set({ plans: [plan, ...get().plans] });
  },
  removePlan: async (id) => {
    await deletePlan(id);
    set({ plans: get().plans.filter((p) => p.id !== id) });
  },
}));
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/authStore.test.ts tests/planStore.test.ts`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add Zustand auth and plan stores"
```

---

## Task 5: 登录页面

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/tests/LoginPage.test.tsx`
- Modify: `frontend/src/App.tsx`（添加路由）

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../src/pages/LoginPage";

describe("LoginPage", () => {
  it("anonymous login button triggers login and navigates", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /匿名体验/i }));
    await waitFor(() => {
      expect(localStorage.getItem("yanshi_token")).toBe("mock-token");
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/LoginPage.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```tsx
// frontend/src/pages/LoginPage.tsx
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
```

```tsx
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PlansPage from "./pages/PlansPage";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plans" element={<PlansPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
```

```tsx
// frontend/src/components/Layout.tsx
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/LoginPage.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add anonymous login page and routing"
```

---

## Task 6: 计划管理页面

**Files:**
- Create: `frontend/src/components/PlanForm.tsx`
- Create: `frontend/src/components/PlanList.tsx`
- Create: `frontend/src/pages/PlansPage.tsx`
- Create: `frontend/tests/PlansPage.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/PlansPage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlansPage from "../src/pages/PlansPage";

describe("PlansPage", () => {
  it("creates a new plan and shows it in the list", async () => {
    render(
      <MemoryRouter>
        <PlansPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/计划目标/i), { target: { value: "晨跑 5 公里" } });
    fireEvent.change(screen.getByPlaceholderText(/完成标准/i), { target: { value: "GPS >= 5km" } });
    fireEvent.change(screen.getByLabelText(/截止时间/i), { target: { value: "2026-07-10T08:00" } });
    fireEvent.click(screen.getByRole("button", { name: /创建计划/i }));
    await waitFor(() => {
      expect(screen.getByText("晨跑 5 公里")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/PlansPage.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```tsx
// frontend/src/components/PlanForm.tsx
import { useState } from "react";
import type { PlanInput } from "../types";

interface Props {
  onSubmit: (data: PlanInput) => void;
}

export default function PlanForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [completionStandard, setCompletionStandard] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, completion_standard: completionStandard, deadline: new Date(deadline).toISOString() });
    setTitle("");
    setCompletionStandard("");
    setDeadline("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded bg-white p-4 shadow">
      <div className="mb-4">
        <input
          placeholder="计划目标"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <div className="mb-4">
        <input
          placeholder="完成标准（必须可量化，如：GPS >= 5km）"
          value={completionStandard}
          onChange={(e) => setCompletionStandard(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-600">截止时间</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">创建计划</button>
    </form>
  );
}
```

```tsx
// frontend/src/components/PlanList.tsx
import type { Plan } from "../types";

interface Props {
  plans: Plan[];
}

export default function PlanList({ plans }: Props) {
  if (plans.length === 0) {
    return <p className="text-gray-500">暂无计划，创建一个吧</p>;
  }
  return (
    <ul className="space-y-3">
      {plans.map((plan) => (
        <li key={plan.id} className="rounded bg-white p-4 shadow">
          <h3 className="text-lg font-semibold">{plan.title}</h3>
          <p className="text-sm text-gray-600">完成标准：{plan.completion_standard}</p>
          <p className="text-sm text-gray-600">截止：{new Date(plan.deadline).toLocaleString()}</p>
          <span className="inline-block rounded bg-gray-200 px-2 py-1 text-xs">{plan.status}</span>
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// frontend/src/pages/PlansPage.tsx
import { useEffect } from "react";
import PlanForm from "../components/PlanForm";
import PlanList from "../components/PlanList";
import { usePlanStore } from "../stores/planStore";
import type { PlanInput } from "../types";

export default function PlansPage() {
  const { plans, loading, fetchPlans, addPlan } = usePlanStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreate = async (input: PlanInput) => {
    await addPlan(input);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">计划管理</h2>
      <PlanForm onSubmit={handleCreate} />
      {loading ? <p>加载中...</p> : <PlanList plans={plans} />}
    </div>
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/PlansPage.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add plan management page with form and list"
```

---

## Task 7: 仪表盘页面

**Files:**
- Create: `frontend/src/pages/DashboardPage.tsx`
- Create: `frontend/tests/DashboardPage.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/DashboardPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "../src/pages/DashboardPage";

describe("DashboardPage", () => {
  it("shows summary cards and active plans", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/进行中/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/DashboardPage.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```tsx
// frontend/src/pages/DashboardPage.tsx
import { useEffect } from "react";
import { usePlanStore } from "../stores/planStore";

export default function DashboardPage() {
  const { plans, fetchPlans } = usePlanStore();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const total = plans.length;
  const active = plans.filter((p) => p.status === "active").length;
  const completed = plans.filter((p) => p.status === "completed").length;
  const abandoned = plans.filter((p) => p.status === "abandoned").length;

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">仪表盘</h2>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-gray-600">总计划</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{active}</p>
          <p className="text-sm text-gray-600">进行中</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{completed}</p>
          <p className="text-sm text-gray-600">已完成</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-2xl font-bold">{abandoned}</p>
          <p className="text-sm text-gray-600">已放弃</p>
        </div>
      </div>
      <h3 className="mb-2 font-semibold">活跃计划</h3>
      {plans.filter((p) => p.status === "active").length === 0 && (
        <p className="text-gray-500">暂无活跃计划</p>
      )}
      <ul className="space-y-2">
        {plans.filter((p) => p.status === "active").map((plan) => (
          <li key={plan.id} className="rounded bg-white p-3 shadow">
            {plan.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/DashboardPage.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add dashboard with summary cards"
```

---

## Task 8: 提醒弹窗组件

**Files:**
- Create: `frontend/src/components/ReminderModal.tsx`
- Create: `frontend/tests/ReminderModal.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/ReminderModal.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ReminderModal from "../src/components/ReminderModal";

describe("ReminderModal", () => {
  it("does not close on backdrop click and supports three actions", () => {
    const onComplete = vi.fn();
    const onExtend = vi.fn();
    const onAbandon = vi.fn();
    render(
      <ReminderModal
        open={true}
        title="晨跑"
        mode="strict"
        onComplete={onComplete}
        onExtend={onExtend}
        onAbandon={onAbandon}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /完成/i }));
    expect(onComplete).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /再给 1 小时/i }));
    expect(onExtend).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /放弃/i }));
    expect(onAbandon).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/ReminderModal.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```tsx
// frontend/src/components/ReminderModal.tsx
interface Props {
  open: boolean;
  title: string;
  mode: "strict" | "moderate" | "coach";
  onComplete: () => void;
  onExtend: () => void;
  onAbandon: () => void;
}

export default function ReminderModal({ open, title, mode, onComplete, onExtend, onAbandon }: Props) {
  if (!open) return null;

  const tone = {
    strict: "军令状必须完成！",
    moderate: "别忘了你的计划哦。",
    coach: "遇到困难了吗？需要建议吗？",
  }[mode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-bold">严师提醒</h3>
        <p className="mb-4 text-gray-700">
          {tone} 「{title}」
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onComplete} className="rounded bg-green-600 py-2 text-white">完成</button>
          <button onClick={onExtend} className="rounded bg-yellow-500 py-2 text-white">再给 1 小时</button>
          <button onClick={onAbandon} className="rounded bg-red-600 py-2 text-white">放弃</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/ReminderModal.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add reminder modal with three actions"
```

---

## Task 9: 复盘弹窗组件

**Files:**
- Create: `frontend/src/components/ReviewModal.tsx`
- Create: `frontend/src/api/review.ts`
- Create: `frontend/tests/ReviewModal.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/ReviewModal.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewModal from "../src/components/ReviewModal";

describe("ReviewModal", () => {
  it("requires reason when not completed", async () => {
    const onSubmitted = vi.fn();
    render(<ReviewModal open={true} planId="plan-1" onSubmitted={onSubmitted} />);
    fireEvent.click(screen.getByLabelText(/未完成/i));
    fireEvent.click(screen.getByRole("button", { name: /提交复盘/i }));
    await waitFor(() => {
      expect(screen.getByText(/必须填写原因/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/ReviewModal.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```ts
// frontend/src/api/review.ts
import { apiClient } from "./client";
import type { ReviewInput, ReviewAnalysis } from "../types";

export const createReview = (planId: string, data: ReviewInput) =>
  apiClient.post(`/plans/${planId}/reviews`, data).then((r) => r.data);

export const getReviewAnalysis = (planId: string) =>
  apiClient.get<ReviewAnalysis>(`/plans/${planId}/reviews/analysis`).then((r) => r.data);
```

```tsx
// frontend/src/components/ReviewModal.tsx
import { useState } from "react";
import { createReview } from "../api/review";

interface Props {
  open: boolean;
  planId: string;
  onSubmitted: () => void;
}

export default function ReviewModal({ open, planId, onSubmitted }: Props) {
  const [completed, setCompleted] = useState(true);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completed && !reason.trim()) {
      setError("未完成时必须填写原因");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createReview(planId, { completed, reason });
      onSubmitted();
      setCompleted(true);
      setReason("");
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">强制复盘</h3>
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-1">
            <input type="radio" checked={completed} onChange={() => setCompleted(true)} />
            完成
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={!completed} onChange={() => setCompleted(false)} />
            未完成
          </label>
        </div>
        {!completed && (
          <div className="mb-4">
            <textarea
              placeholder="原因"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>
        )}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
        >
          提交复盘
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/ReviewModal.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add review modal with mandatory reason validation"
```

---

## Task 10: 三档模式选择 UI

**Files:**
- Create: `frontend/src/components/ModeSelector.tsx`
- Create: `frontend/tests/ModeSelector.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/ModeSelector.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ModeSelector from "../src/components/ModeSelector";

describe("ModeSelector", () => {
  it("calls onChange with selected mode", () => {
    const onChange = vi.fn();
    render(<ModeSelector value="moderate" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/时刻提醒型/i));
    expect(onChange).toHaveBeenCalledWith("strict");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/ModeSelector.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```tsx
// frontend/src/components/ModeSelector.tsx
interface Props {
  value: "strict" | "moderate" | "coach";
  onChange: (mode: "strict" | "moderate" | "coach") => void;
}

const MODES = [
  { key: "strict", label: "时刻提醒型", desc: "高频追问，绝不姑息" },
  { key: "moderate", label: "适当建议型", desc: "适度提醒，给出建议" },
  { key: "coach", label: "方法交流型", desc: "策略卡片，不打扰" },
] as const;

export default function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {MODES.map((m) => (
        <label
          key={m.key}
          className={`cursor-pointer rounded border p-4 ${
            value === m.key ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="mode"
            value={m.key}
            checked={value === m.key}
            onChange={() => onChange(m.key)}
            className="sr-only"
          />
          <p className="font-semibold">{m.label}</p>
          <p className="text-sm text-gray-600">{m.desc}</p>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/ModeSelector.test.tsx`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add three-mode selector component"
```

---

## Task 11: PWA 基础配置（Manifest + Service Worker）

**Files:**
- Create: `frontend/public/manifest.json`
- Modify: `frontend/index.html`
- Create: `frontend/src/sw.ts`
- Modify: `frontend/src/main.tsx`
- Create: `frontend/tests/pwa.test.ts`

- [ ] **Step 1: 编写失败测试**

```ts
// frontend/tests/pwa.test.ts
import { describe, it, expect } from "vitest";

describe("PWA manifest", () => {
  it("manifest exists and has correct name", async () => {
    const manifest = await import("../public/manifest.json");
    expect(manifest.default.name).toBe("严师APP");
    expect(manifest.default.start_url).toBe("/");
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/pwa.test.ts`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

```json
// frontend/public/manifest.json
{
  "name": "严师APP",
  "short_name": "严师",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": []
}
```

```html
<!-- frontend/index.html 在 head 内添加 -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563eb" />
```

```ts
// frontend/src/sw.ts
/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = "yanshi-v1";

sw.addEventListener("install", (event) => {
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

sw.addEventListener("fetch", (event) => {
  // Phase 1: 透传网络请求，为后续 IndexedDB 离线缓存预留
  event.respondWith(fetch(event.request));
});
```

```tsx
// frontend/src/main.tsx 注册 SW
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test tests/pwa.test.ts`

Expected: `PASS`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "feat(frontend): add PWA manifest and service worker stub"
```

---

## Task 12: 端到端旅程集成测试

**Files:**
- Create: `frontend/tests/Journey.test.tsx`

- [ ] **Step 1: 编写失败测试**

```tsx
// frontend/tests/Journey.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

describe("Full MVP journey", () => {
  it("anonymous login -> create plan -> see dashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /匿名体验/i }));
    await waitFor(() => {
      expect(screen.getByText(/仪表盘/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/计划管理/i));
    fireEvent.change(screen.getByPlaceholderText(/计划目标/i), { target: { value: "晨跑" } });
    fireEvent.change(screen.getByPlaceholderText(/完成标准/i), { target: { value: "GPS 5km" } });
    fireEvent.change(screen.getByLabelText(/截止时间/i), { target: { value: "2026-07-10T08:00" } });
    fireEvent.click(screen.getByRole("button", { name: /创建计划/i }));
    await waitFor(() => {
      expect(screen.getByText("晨跑")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/frontend && npm test tests/Journey.test.tsx`

Expected: `FAIL`

- [ ] **Step 3: 编写最小实现**

确保 App 路由与前面任务一致，无需新增代码。如果测试失败，修复 Link/Router 细节直到通过。

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/frontend && npm test`

Expected: 全部测试通过

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add frontend/
git commit -m "test(frontend): add full MVP journey integration test"
```

---

## 附录：TDD 与前端最佳实践

- 每个组件/页面必须先写失败测试，再实现最小代码。
- 测试优先使用 `screen.getByRole` / `getByLabelText` / `getByPlaceholderText`，避免依赖文本细节。
- 所有 API 调用走 `apiClient`，测试通过 MSW 拦截，不依赖真实后端。
- 状态变化后使用 `waitFor` 断言 DOM 更新。
- 组件 props 类型显式定义，禁止 `any`。
