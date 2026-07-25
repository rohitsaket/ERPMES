"use client";

import { Building2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  hasFilters?: boolean;
  onCreate?: () => void;
}

export function VendorEmptyState({ hasFilters, onCreate }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      {hasFilters ? (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No matching vendors</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </>
      ) : (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first vendor to start procurement</p>
          {onCreate && (
            <Link href="/master-data/vendors/new">
              <Button className="mt-4">Create Vendor</Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
