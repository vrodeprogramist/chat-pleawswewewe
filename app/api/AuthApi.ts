// app/api/authApi.ts
import { apiClient } from "./client";
// Интерфейс для данных логина
interface LoginPayload {
 email: string;
 password: string;
 remember?: boolean;
}
// Интерфейс для данных регистрации
interface RegisterPayload {
 name: string;
 email: string;
 password: string;
 agree: boolean;
}
// Интерфейс для ответа с сервера
interface AuthResponse {
 token?: string;
 user?: {
 id: number;
 email: string;
 name?: string;
 };
 message?: string;
}
// Объект с функциями для API
export const authApi = {
 // Функция для логина
 login: (credentials: LoginPayload) => {
 return apiClient<AuthResponse>("/api/auth/login", "POST", credentials);
 },
 // Функция для регистрации
 register: (data: RegisterPayload) => {
 return apiClient<AuthResponse>("/api/auth/register", "POST", data);
 },
 // Функция для выхода
 logout: () => {
 return apiClient<void>("/api/auth/logout", "POST");
 },
};