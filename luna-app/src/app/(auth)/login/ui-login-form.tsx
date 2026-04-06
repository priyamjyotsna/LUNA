"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({
  showGoogle,
  registered,
  sessionStale,
}: {
  showGoogle: boolean;
  registered: boolean;
  sessionStale?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registered) {
      toast.success("Account created. You can sign in now.");
      router.replace("/login", { scroll: false });
    }
  }, [registered, router]);

  useEffect(() => {
    if (sessionStale) {
      toast.info("Please sign in again. Your saved session no longer matches this database.");
    }
  }, [sessionStale]);

  async function onCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {showGoogle ? (
        <Button
          type="button"
          variant="outline"
          className="mt-6 w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </Button>
      ) : null}
      <form onSubmit={onCredentials} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </>
  );
}
