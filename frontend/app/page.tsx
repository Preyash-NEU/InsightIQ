import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE } from "./api/auth/login/route";

export default async function IndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}
