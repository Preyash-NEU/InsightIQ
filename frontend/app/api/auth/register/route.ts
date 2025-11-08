import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

import { register } from "@/lib/api-client";
import { AUTH_COOKIE } from "../login/route";

const isProd = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  try {
    const { data } = await register(payload);

    const response = NextResponse.json({ user: data.user }, { status: 201 });

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
        "Unable to register with provided details"
      : "Unexpected error";

    return NextResponse.json({ error: message }, { status });
  }
}
