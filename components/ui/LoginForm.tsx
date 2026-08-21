"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
interface LoginFormProps {
 onSubmit?: (data: {
 email: string;
 password: string;
 remember: boolean;
 }) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [remember, setRemember] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [emailError, setEmailError] = useState("");
 const [passwordError, setPasswordError] = useState("");
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 setEmailError("");
 setPasswordError("");
 if (!email) {
 setEmailError("Email обязателен");
 return;
 }
 if (!password) {
 setPasswordError("Пароль обязателен");
 return;
 }
 setLoading(true);
 try {
 const response = await fetch("/api/auth/login", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ email, password, remember }),
 });
 const data = await response.json();
 if (!response.ok) {
 throw new Error(data.error || "Ошибка входа");
 }
 setEmail("");
 setPassword("");
 if (onSubmit) {
 onSubmit({ email, password, remember });
 } else {
 console.log("Успешный вход:", data);
 }
 } catch (err) {
 const errorMessage = err instanceof Error ? err.message : "Ошибка входа";
 setError(errorMessage);
 } finally {
 setLoading(false);
 }
 };
 return (
 <form onSubmit={handleSubmit} className="space-y-4 w-full">
 {error && (
 <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
 {error}
 </div>
 )}
 <Input
 type="email"
 label="Email"
 placeholder="example@mail.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 error={emailError}
 required
 disabled={loading}
 />
 <Input
 type="password"
 label="Пароль"
 placeholder="Введите пароль"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 error={passwordError}
 required
 disabled={loading}
 />
 <Checkbox
 label="Запомнить меня"
 checked={remember}
 onChange={setRemember}
 disabled={loading}
 />
 <Button variant="primary" size="md" fullWidth disabled={loading}>
 {loading ? "Вход в процессе..." : "Войти"}
 </Button>
 <p className="text-center text-sm text-gray-600">
 <a href="#" className="text-blue-500 hover:underline">
 Забыли пароль?
 </a>
 </p>
 </form>
 );
}
