// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
interface UsersData {
 users: Array<{
 id: number;
 email: string;
 password: string;
 name?: string;
 }>;
}
function readUsers(): UsersData {
 try {
 const filePath = path.join(process.cwd(), "public", "data", "users.json");
 const data = fs.readFileSync(filePath, "utf-8");
 return JSON.parse(data);
 } catch {
 return { users: [] };
 }
}
function writeUsers(data: UsersData): void {
 const filePath = path.join(process.cwd(), "public", "data", "users.json");
 const dir = path.dirname(filePath);
 if (!fs.existsSync(dir)) {
 fs.mkdirSync(dir, { recursive: true });
 }
 fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
export async function POST(request: NextRequest) {
 try {
 const { name, email, password, agree } = await request.json();
 if (!agree) {
 return NextResponse.json(
 { error: "Необходимо согласиться с условиями использования" },
 { status: 400 }
 );
 }
 const data = readUsers();
 const existingUser = data.users.find((u) => u.email === email);
 if (existingUser) {
 return NextResponse.json(
 { error: "Пользователь с таким email уже существует" },
 { status: 400 }
 );
 }
 const newUser = {
 id: Math.max(...data.users.map((u) => u.id), 0) + 1,
 email,
 password,
 name,
 };
 data.users.push(newUser);
 writeUsers(data);
 const token = `token-${newUser.id}-${Date.now()}`;
 const response = {
 success: true,
 message: "Регистрация прошла успешно!",
 token,
 user: {
 id: newUser.id,
 email: newUser.email,
 name: newUser.name,
 },
 };
 console.log("Новый пользователь зарегистрирован:", newUser);
 const res = NextResponse.json(response, { status: 201 });
 res.cookies.set("auth_token", token, {
 httpOnly: true,
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 maxAge: 30 * 24 * 60 * 60,
 });
 return res;
 } catch (error) {
 return NextResponse.json(
 { error: error instanceof Error ? error.message : "Ошибка регистрации" },
 { status: 500 }
 );
 }
}
