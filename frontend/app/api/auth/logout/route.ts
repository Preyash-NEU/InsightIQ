import { NextResponse } from "next/server";

import { AUTH_COOKIE } from "../login/route";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
