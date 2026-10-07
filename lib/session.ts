import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * For use inside Server Components under routes already protected by
 * middleware.ts (/dashboard, /lab, /instructor). Those routes guarantee a
 * session exists, so this narrows the type without a `!` scattered
 * everywhere. If somehow called outside a protected route, it throws
 * instead of silently continuing with a null user.
 */
export async function requireSession(): Promise<
  Session & { user: NonNullable<Session["user"]> }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("requireSession() called outside a route protected by middleware.ts");
  }
  return session as Session & { user: NonNullable<Session["user"]> };
}
