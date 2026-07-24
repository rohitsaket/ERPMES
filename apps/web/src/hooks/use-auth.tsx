"use client";

import {
  useAuth as useClerkAuth,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

export interface AuthState {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
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

const AuthContext = createContext<AuthState | null>(null);

const devAuthState: AuthState = {
  isLoaded: true,
  isSignedIn: true,
  user: {
    imageUrl: "",
    fullName: "Dev User",
    firstName: "Dev",
    lastName: "User",
    primaryEmailAddress: { emailAddress: "dev@diamondflow.local" },
    publicMetadata: { permissions: ["manage:permission:company", "read:production-order", "write:operation", "read:sales-order", "write:sales-order", "read:inventory", "write:inventory", "read:quality", "write:quality"] },
  },
  signOut: async () => undefined,
  getToken: async () => "mock-dev-token",
  organization: { name: "Dev Company" },
};

const unavailableAuthState: AuthState = {
  isLoaded: true,
  isSignedIn: false,
  user: null,
  signOut: async () => undefined,
  getToken: async () => null,
  organization: null,
};

export function UnconfiguredAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={unavailableAuthState}>
      {children}
    </AuthContext.Provider>
  );
}

export function DevAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={devAuthState}>
      {children}
    </AuthContext.Provider>
  );
}

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, signOut, getToken } = useClerkAuth();
  const { user } = useUser();
  const { organization } = useOrganization();

  const value: AuthState = {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    user: user
      ? {
          imageUrl: user.imageUrl,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          primaryEmailAddress: user.primaryEmailAddress
            ? { emailAddress: user.primaryEmailAddress.emailAddress }
            : null,
          publicMetadata: user.publicMetadata as Record<string, unknown>,
        }
      : null,
    signOut: async () => {
      await signOut();
    },
    getToken: async () => getToken(),
    organization: organization ? { name: organization.name } : null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth?.isLoaded && !auth.isSignedIn && pathname !== "/login") {
      router.push("/login");
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
