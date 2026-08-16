// app/api/auth/login/route.ts
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
export async function POST(request: NextRequest) {
 try {
 const { email, password, remember } = await request.json();
 const data = readUsers();
 const user = data.users.find((u) => u.email === email);

  if (!user) {
 return NextResponse.json(
 { error: "Пользователь не найден" },
 { status: 401 }
 );
 }
 if (user.password !== password) {
 return NextResponse.json(
 { error: "Неправильный пароль" },
 { status: 401 }
 );
 }
 const token = `token-${user.id}-${Date.now()}`;
 const response = {
 success: true,
 token,
 user: {
 id: user.id,
 email: user.email,
 name: user.name,
 },
 };
 const res = NextResponse.json(response, { status: 200 });
 res.cookies.set("auth_token", token, {
 httpOnly: true,
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 maxAge: remember ? 30 * 24 * 60 * 60 : undefined,
 });
 return res;
 } catch (error) {
 return NextResponse.json(
 { error: error instanceof Error ? error.message : "Ошибка логина" },
 { status: 500 }
 );
 }
}
