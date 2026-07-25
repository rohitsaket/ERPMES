import { Upload, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorDashboard, useVendorCategories, useTopVendors } from "@/hooks/use-vendors";

interface InsightsProps {
  onImport?: () => void;
  onExport?: () => void;
}

export function VendorInsights({ onImport, onExport }: InsightsProps) {
  // Use React Query hooks to fetch live backend data
  const { data: dashboard, isLoading: dashLoading } = useVendorDashboard();
  const { data: categories, isLoading: catLoading } = useVendorCategories();
  const { data: topVendors, isLoading: topLoading } = useTopVendors();

  const total = dashboard?.total || 0;
  const active = dashboard?.active || 0;
  const pending = dashboard?.pending || 0;
  const inactive = dashboard?.inactive || 0;

  // Formula: (status count / total) * 100
  // Handle Division by Zero appropriately.
  const activePercent = total > 0 ? (active / total) * 100 : 0;
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0;
  const inactivePercent = total > 0 ? (inactive / total) * 100 : 0;

  // Donut chart variables
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  
  const activeStroke = (activePercent / 100) * circumference;
  const pendingStroke = (pendingPercent / 100) * circumference;
  const inactiveStroke = (inactivePercent / 100) * circumference;
  
  const activeOffset = 0;
  const pendingOffset = -activeStroke;
  const inactiveOffset = pendingOffset - pendingStroke;

  // Map backend categories to colors
  const colorMap = [
    { color: "bg-blue-500", iconColor: "text-blue-500", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    { color: "bg-emerald-500", iconColor: "text-emerald-500", iconBg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { color: "bg-orange-500", iconColor: "text-orange-500", iconBg: "bg-orange-100 dark:bg-orange-900/30" },
    { color: "bg-purple-500", iconColor: "text-purple-500", iconBg: "bg-purple-100 dark:bg-purple-900/30" },
    { color: "bg-slate-500", iconColor: "text-slate-500", iconBg: "bg-slate-100 dark:bg-slate-800" },
  ];

  return (
    <div className="w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-4">
      {/* Overview Card */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Vendor Overview</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
        </div>
        
        {dashLoading ? (
          <div className="flex justify-center items-center h-32"><div className="h-24 w-24 rounded-full bg-muted animate-pulse" /></div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
                {total > 0 && (
                  <>
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" className="text-emerald-500 transition-all duration-1000 ease-in-out" strokeDasharray={`${activeStroke} ${circumference}`} strokeDashoffset={activeOffset} strokeLinecap="round" />
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" className="text-amber-500 transition-all duration-1000 ease-in-out" strokeDasharray={`${pendingStroke} ${circumference}`} strokeDashoffset={pendingOffset} strokeLinecap="round" />
                    <circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" className="text-rose-500 transition-all duration-1000 ease-in-out" strokeDasharray={`${inactiveStroke} ${circumference}`} strokeDashoffset={inactiveOffset} strokeLinecap="round" />
                  </>
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{total}</span>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">Total</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Active</span>
                  <span className="text-[10px] text-muted-foreground">{active} ({Math.round(activePercent)}%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Pending</span>
                  <span className="text-[10px] text-muted-foreground">{pending} ({Math.round(pendingPercent)}%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">Inactive</span>
                  <span className="text-[10px] text-muted-foreground">{inactive} ({Math.round(inactivePercent)}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Categories */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Top Vendor Categories</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
        </div>
        
        <div className="space-y-4">
          {catLoading ? (
            <div className="space-y-3">
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
            </div>
          ) : !categories || categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No categories data</p>
          ) : (
            categories.map((category, index) => {
              const theme = colorMap[index % colorMap.length] as typeof colorMap[0];
              return (
                <div key={category.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${theme.iconBg} ${theme.iconColor}`}>
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                      <span className="font-medium truncate max-w-[120px]">{category.name}</span>
                    </div>
                    <span className="text-muted-foreground">{category.count} ({category.percent}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${theme.color} rounded-full`} style={{ width: `${category.percent}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Top Vendors */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Top Vendors by Outstanding</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button>
        </div>
        
        <div className="space-y-3">
          {topLoading ? (
            <div className="space-y-3">
              <div className="h-5 w-full bg-muted animate-pulse rounded" />
              <div className="h-5 w-full bg-muted animate-pulse rounded" />
              <div className="h-5 w-full bg-muted animate-pulse rounded" />
            </div>
          ) : !topVendors || topVendors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No top vendors data</p>
          ) : (
            topVendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium truncate pr-4">{vendor.name}</span>
                <span className="font-semibold">{vendor.amount}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
        <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-900"
            onClick={onImport}
          >
            <Upload className="mr-2 h-4 w-4" /> Import Vendors
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-900"
            onClick={onExport}
          >
            <Download className="mr-2 h-4 w-4" /> Export Vendors
          </Button>
        </div>
      </div>
    </div>
  );
}
