import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";

import { fetchCurrentUser } from "@/lib/api-client";
import { AUTH_COOKIE } from "../login/route";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await fetchCurrentUser(token);
    return NextResponse.json(data);
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status ?? 500
      : 500;
    const message = axios.isAxiosError(error)
      ? (error.response?.data as { detail?: string } | undefined)?.detail ??
        "Unable to fetch user profile"
      : "Unexpected error";

    return NextResponse.json({ error: message }, { status });
  }
}
