import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-4">
      <div id="main-content" className="w-full max-w-md" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
