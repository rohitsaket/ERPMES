"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { Session } from "next-auth";

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id?: string;
    imageUrl: string;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    primaryEmailAddress: { emailAddress: string } | null;
    publicMetadata: Record<string, unknown>;
  } | null;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  organization: { name: string } | null;
}

export type { Session };

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";

  const value: AuthState = {
    isLoaded,
    isSignedIn,
    user: session?.user
      ? {
          id: session.user.id as string | undefined,
          imageUrl: session.user.image || "",
          fullName: session.user.name || null,
          firstName: (session.user as any).firstName || (session.user.name?.split(" ")[0] ?? null),
          lastName: (session.user as any).lastName || (session.user.name?.split(" ").slice(1).join(" ") ?? null),
          primaryEmailAddress: session.user.email
            ? { emailAddress: session.user.email }
            : null,
          publicMetadata: {
            role: (session.user as any).role,
            companyId: (session.user as any).companyId,
          },
        }
      : null,
    signOut: async () => {
      await nextAuthSignOut({ callbackUrl: "/sign-in" });
    },
    getToken: async () => null,
    organization: null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth?.isLoaded && !auth.isSignedIn && pathname !== "/sign-in" && pathname !== "/sign-up" && pathname !== "/forgot-password" && pathname !== "/reset-password" && pathname !== "/verify-email") {
      router.push("/sign-in");
    }
  }, [auth?.isLoaded, auth?.isSignedIn, pathname, router]);

  if (!auth) {
    throw new Error("useAuth must be used within an authentication provider");
  }

  return auth;
}

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const role = user.publicMetadata?.role as string;
    if (role === "SUPER_ADMIN" || role === "admin" || role === "ADMIN") return true;
    
    const userPermissions = (user.publicMetadata?.permissions as string[]) || [];
    return userPermissions.includes(permission) || userPermissions.includes("manage:permission:company");
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(hasPermission);
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
