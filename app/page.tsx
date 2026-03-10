"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Github, Loader2, LogOut } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
          Hello World!
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Welcome to ContriboScope. This page demonstrates the basic setup with Next.js App Router, Tailwind CSS, and GitHub Authentication.
        </p>

        <div className="w-full max-w-sm mt-8 p-6 bg-card rounded-xl border shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Authentication Status
            </h2>

            {status === "loading" ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking session...</span>
              </div>
            ) : session ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-destructive-foreground bg-destructive rounded-md hover:bg-destructive/90 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  You are not signed in.
                </p>
                <button
                  onClick={() => signIn("github")}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  Sign in with GitHub
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
