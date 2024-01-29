'use client';

import { redirect } from "next/navigation";

export default function RedirectUI() {
  
  const searchParams = new URLSearchParams(window.location.search);
  return redirect(searchParams.has("redirectURL") ? (searchParams.get("redirectURL") as string) : "/");
}
