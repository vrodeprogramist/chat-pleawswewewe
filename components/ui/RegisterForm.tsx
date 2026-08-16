"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";

interface RegisterFormProps {
 onSubmit?: (data: {
 name: string;
 email: string;
 password: string;
 agree: boolean;
 }) => void;
}
export default function RegisterForm({ onSubmit }: RegisterFormProps) {
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [agree, setAgree] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");
 const [nameError, setNameError] = useState("");
 const [emailError, setEmailError] = useState("");
 const [passwordError, setPasswordError] = useState("");
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 setSuccess("");
 setNameError("");
 setEmailError("");
 setPasswordError("");
 if (!name.trim()) {
 setNameError("Имя обязательно");
 return;
 }
 if (!email) {
 setEmailError("Email обязателен");
 return;
 }
 if (!password || password.length < 8) {
 setPasswordError("Пароль должен быть не менее 8 символов");
 return;
 }
 if (!agree) {
 setError("Необходимо согласиться с условиями использования");
 return;
 }
 setLoading(true);
 try {
 const response = await fetch("/api/auth/register", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 name: name.trim(),
 email,
 password,
 agree,
 }),
 });
 const data = await response.json();
 if (!response.ok) {
 throw new Error(data.error || "Ошибка регистрации");
 }
 setName("");
 setEmail("");
 setPassword("");
 setAgree(false);
 setSuccess("Регистрация прошла успешно! Перенаправляем...");
 if (onSubmit) {
 onSubmit({ name, email, password, agree });
 } else {
 console.log("Успешная регистрация:", data);
 }
 } catch (err) {
 const errorMessage =
 err instanceof Error ? err.message : "Ошибка регистрации";
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
 {success && (
 <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
 {success}
 </div>
 )}
 <Input
 type="text"
 label="Имя"
 placeholder="Иван Петров"
 value={name}
 onChange={(e) => setName(e.target.value)}
 error={nameError}
 required
 disabled={loading}
 />
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
 placeholder="Минимум 8 символов"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 error={passwordError}
 required
 disabled={loading}
 />
 <Checkbox
 label="Я согласен с условиями использования"
 checked={agree}
 onChange={setAgree}
 disabled={loading}
 />
 <Button
 variant="primary"
 size="md"
 fullWidth
 disabled={!agree || loading}
 >
 {loading ? "Регистрация..." : "Зарегистрироваться"}
 </Button>
 <p className="text-center text-sm text-gray-600">
 Уже есть аккаунт?{" "}
 <a href="/login" className="text-blue-500 hover:underline">
 Войти
 </a>
 </p>
 </form>
 );
}
