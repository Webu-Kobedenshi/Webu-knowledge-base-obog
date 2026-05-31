import { Button } from "@/components/atoms/button";
import { Suspense } from "react";
import { LoginPageClient } from "./login-page-client";
import { LoginButtonContent, LoginPageContent } from "./login-page-content";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <LoginPageContent
      loginButton={
        <Button
          type="button"
          className="mt-6 h-12 w-full bg-zinc-950 text-base text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          disabled
        >
          <LoginButtonContent />
        </Button>
      }
    />
  );
}
