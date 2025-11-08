import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

import { login } from "@/lib/api-client";

const AUTH_COOKIE = "insightiq.auth-token";
const isProd = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  const credentials = await request.json();

  try {
    const { data } = await login(credentials);

    const response = NextResponse.json({ user: data.user });

    response.cookies.set({
      name: AUTH_COOKIE,
      value: data.access_token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isProd,
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status ?? 500
      : 500;
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { detail?: string } | undefined)?.detail ??
        "Unable to login with provided credentials"
      : "Unexpected error";

    return NextResponse.json({ error: message }, { status });
  }
}

export { AUTH_COOKIE };
