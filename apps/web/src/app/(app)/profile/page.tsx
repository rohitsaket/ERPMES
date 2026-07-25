"use client";

import { Building2, Mail, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, organization } = useAuth();
  const avatarText = user?.firstName?.[0] || "U";

  return (
    <AppShell>
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Your current account and organization context.</p>
        </div>
        <Card className="min-w-0 max-w-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 shrink-0">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? "User"} />
              <AvatarFallback>{avatarText}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate">{user?.fullName ?? "User"}</CardTitle>
              <p className="truncate text-sm text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress ?? "No email available"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 flex-1 flex flex-col min-h-0">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <UserRound className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Name</p>
                <p className="truncate text-sm text-muted-foreground">{user?.fullName ?? "Not available"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Email</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ?? "Not available"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4 sm:col-span-2">
              <Building2 className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Organization</p>
                <p className="truncate text-sm text-muted-foreground">
                  {organization?.name ?? "No organization selected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
