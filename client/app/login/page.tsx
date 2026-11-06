"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthDialog, { type AuthMode } from "@/components/AuthDialog";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");
  const safeRedirect = redirect?.startsWith("/") ? redirect : "/";
  const [authMode, setAuthMode] = useState<AuthMode>(
    searchParams.get("mode") === "register" ? "register" : "login",
  );

  return (
    <AuthDialog
      open
      onClose={() => router.replace(safeRedirect)}
      mode={authMode}
      onModeChange={setAuthMode}
      redirectTo={safeRedirect}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
