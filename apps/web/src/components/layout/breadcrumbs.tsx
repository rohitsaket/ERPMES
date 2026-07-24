"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = (pathname ?? "").split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="scrollbar-hide flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap pb-1 text-sm text-muted-foreground"
    >
      <Link
        href="/dashboard"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isCurrent = index === segments.length - 1;
        const hasPage = index > 0 || href === "/analytics";

        return (
          <span
            key={href}
            className={`min-w-0 items-center gap-1 ${
              isCurrent ? "flex" : "hidden sm:flex"
            }`}
          >
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            {isCurrent || !hasPage ? (
              <span
                className={`max-w-56 truncate sm:max-w-none ${
                  isCurrent ? "font-medium text-foreground" : ""
                }`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="flex min-h-9 items-center rounded-md px-2 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
