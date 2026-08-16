// app/api/client.ts
// Получаем базовый URL из переменных окружения
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Типы для методов HTTP
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
// Универсальная функция для всех API запросов
export async function apiClient<T>(
 endpoint: string, // Путь: /api/users, /api/auth/login
 method: Method = "GET", // Метод запроса
 data?: unknown // Данные для отправки (для POST, PUT)
): Promise<T> {
 // Формируем полный URL
 const url = `${API_URL}${endpoint}`;
 // Заголовки запроса (сообщаем, что отправляем JSON)
 const headers: HeadersInit = {
 "Content-Type": "application/json",
 };
 // Конфигурация запроса
 const options: RequestInit = {
 method,
 headers,
 // Если есть данные и это POST/PUT/PATCH, добавляем их в тело
 ...(data && (method === "POST" || method === "PUT" || method === "PATCH")
 ? { body: JSON.stringify(data) }
 : {}),
 };
 // Отправляем запрос
 const response = await fetch(url, options);
 // Проверяем, успешен ли ответ
 if (!response.ok) {
 throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
 }
 // Если статус 204 (No Content), возвращаем undefined
 if (response.status === 204) {
 return undefined as T;
 }
 // Преобразуем ответ в JSON и возвращаем
 return response.json() as Promise<T>;
}
