"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, User } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
  organizationId: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  SUSPENDED: "bg-red-100 text-red-700",
  PENDING_VERIFICATION: "bg-amber-100 text-amber-700",
};

export default function AdminUsersPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const pageSize = 20;

  useEffect(() => { if (isLoaded && !isSignedIn) router.push("/login"); }, [isLoaded, isSignedIn, router]);
  if (!isLoaded) return <AppShell><div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></AppShell>;
  if (!isSignedIn) return null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", page, search, filterStatus, filterRole],
    queryFn: () => api.get<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/admin/users", {
      page,
      limit: pageSize,
      search,
      status: filterStatus === "all" ? undefined : filterStatus,
      role: filterRole === "all" ? undefined : filterRole,
    }),
    placeholderData: (prev) => prev,
  });

  if (error) return <AppShell><div className="text-center py-20 text-red-600">Failed to load users</div></AppShell>;

  const users = data?.data ?? [];
  const meta = data?.meta;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and access</p>
          </div>
          <Button disabled title="User management is not connected to a backend endpoint yet">
            <Plus className="mr-2 h-4 w-4" />Add User
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle>All Users</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={v => { setFilterRole(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No users found</p>
                <p>Add your first user to get started</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium hidden md:table-cell">Phone</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Last Login</th>
                        <th className="pb-3 font-medium w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 font-medium">{user.firstName} {user.lastName}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className="bg-primary-100 text-primary-700">{user.role}</Badge>
                          </td>
                          <td className="py-3 hidden md:table-cell">{user.phone || "—"}</td>
                          <td className="py-3">
                            <Badge variant="secondary" className={statusColors[user.status] || "bg-gray-100 text-gray-700"}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" aria-label="View" disabled><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" aria-label="Edit" disabled><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" aria-label="Delete" disabled className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.totalPages} ({meta.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                      <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
