"use client"

import { useSession as useNextAuthSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

export const useSession = () => {
    const session = useNextAuthSession();
    return {
        data: session.data ? {
            user: session.data.user,
            session: {
                id: (session.data.user as any)?.id || "session_id",
                userId: (session.data.user as any)?.id || "user_id",
                expiresAt: session.data.expires,
                ipAddress: "127.0.0.1",
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Mozilla/5.0 Chrome/120.0.0.0"
            }
        } : null,
        isPending: session.status === "loading",
        error: null
    };
};

export const signIn = {
    social: ({ provider, callbackURL }: { provider: string, callbackURL?: string }) => {
        return nextAuthSignIn(provider, { callbackUrl: callbackURL || "/dashboard/account" });
    },
    email: ({ email, password, callbackURL }: any) => {
        return nextAuthSignIn("credentials", { email, password, callbackUrl: callbackURL || "/dashboard/account" });
    }
};

export const signOut = ({ fetchOptions }: any = {}) => {
    return nextAuthSignOut({ callbackUrl: "/sign-in" });
};

export const signUp = {
    email: async ({ name, email, password, callbackURL }: any) => {
        return nextAuthSignIn("credentials", { email, password, name, callbackUrl: callbackURL || "/dashboard/account" });
    }
};

export const authClient = {
    useSession,
    signIn,
    signOut,
    signUp
};