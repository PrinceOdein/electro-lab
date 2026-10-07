"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
      <Link href="/" className="font-bold text-slate-100">
        ElectroLab
      </Link>
      <nav className="flex items-center gap-4 text-sm text-slate-300">
        {status === "authenticated" && session.user ? (
          <>
            <span className="text-slate-500">
              {session.user.name} · {session.user.role.toLowerCase()}
            </span>
            {session.user.role === "STUDENT" && (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/experiments">Experiments</Link>
              </>
            )}
            {session.user.role === "INSTRUCTOR" && (
              <>
                <Link href="/instructor">Submissions</Link>
                <Link href="/instructor/students">Students</Link>
              </>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 hover:text-red-300"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
