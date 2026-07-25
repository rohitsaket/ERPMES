import { Users, UserCheck, UserMinus, UserX } from "lucide-react";
import { useVendorDashboard } from "@/hooks/use-vendors";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorKPICards() {
  const { data: dashboard, isLoading } = useVendorDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const total = dashboard?.total || 0;
  const active = dashboard?.active || 0;
  const pending = dashboard?.pending || 0;
  const inactive = dashboard?.inactive || 0;

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  const inactivePercent = total > 0 ? Math.round((inactive / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 shrink-0">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex items-center p-4">
        <div className="mr-4 rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{total}</h3>
            {/* Keeping visual indicator static until historical tracking is implemented */}
            <span className="text-xs font-medium text-green-600">↑ 12%</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex items-center p-4">
        <div className="mr-4 rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{active}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{activePercent}% of total</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex items-center p-4">
        <div className="mr-4 rounded-lg bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <UserMinus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{pending}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{pendingPercent}% of total</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex items-center p-4">
        <div className="mr-4 rounded-lg bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
          <UserX className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Inactive Vendors</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{inactive}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{inactivePercent}% of total</p>
        </div>
      </div>
    </div>
  );
}
