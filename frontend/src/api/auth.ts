import { apiClient } from "./client";
import type { Token } from "../types";

export const anonymousLogin = () => apiClient.post<Token>("/auth/anonymous").then((r) => r.data);
