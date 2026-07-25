"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Building2, Mail, Phone, Globe, MapPin, CreditCard, Banknote, Star, Calendar, DollarSign, FileText, ShoppingCart, BookOpen, History, Paperclip, StickyNote, Shield } from "lucide-react";
import type { Vendor } from "@/lib/api/types";
import { VendorStatusBadge } from "./vendor-status-badge";
import { cn } from "@/lib/utils";

interface Props {
  vendor: Vendor | null;
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "contacts", label: "Contacts", icon: Mail },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "bank", label: "Bank Details", icon: CreditCard },
  { id: "tax", label: "Tax Info", icon: FileText },
  { id: "purchases", label: "Purchase Orders", icon: ShoppingCart },
  { id: "ledger", label: "Ledger", icon: BookOpen },
  { id: "audit", label: "Audit Log", icon: History },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "attachments", label: "Attachments", icon: Paperclip },
] as const;

export function VendorDrawer({ vendor, open, onClose }: Props) {
  const [tab, setTab] = useState("general");

  if (!open || !vendor) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l bg-background shadow-xl animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{vendor.name}</h2>
              <p className="text-xs text-muted-foreground">{vendor.code}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-0 overflow-x-auto border-b px-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status"><VendorStatusBadge status={vendor.status} /></Field>
                <Field label="Vendor Type"><span className="capitalize">{(vendor.vendorType || "").replace(/_/g, " ")}</span></Field>
                <Field label="Category"><span className="capitalize">{(vendor.category || "").replace(/_/g, " ")}</span></Field>
                <Field label="Group">{vendor.vendorGroup || "—"}</Field>
                <Field label="Currency">{vendor.currency || "—"}</Field>
                <Field label="Payment Terms"><span className="capitalize">{(vendor.paymentTerms || "").replace(/_/g, " ")}</span></Field>
                <Field label="Credit Limit">{vendor.creditLimit != null ? `$${vendor.creditLimit.toLocaleString()}` : "—"}</Field>
                <Field label="Outstanding">{vendor.outstandingBalance != null ? `$${vendor.outstandingBalance.toLocaleString()}` : "—"}</Field>
                <Field label="Rating">
                  {vendor.rating != null ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{vendor.rating}/5</span>
                    </div>
                  ) : "—"}
                </Field>
                <Field label="Preferred Supplier">{vendor.preferredSupplier ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Yes</Badge> : "No"}</Field>
              </div>
              <Separator />
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Company</h4>
                <p className="text-sm">{vendor.companyName || vendor.name}</p>
              </div>
            </div>
          )}

          {tab === "contacts" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contact Person">{vendor.contactPerson || "—"}</Field>
                <Field label="Designation">{vendor.designation || "—"}</Field>
                <Field label="Email">
                  {vendor.email ? (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Mail className="h-3 w-3" /> {vendor.email}
                    </a>
                  ) : "—"}
                </Field>
                <Field label="Mobile">
                  {vendor.mobile ? (
                    <a href={`tel:${vendor.mobile}`} className="flex items-center gap-1 text-primary hover:underline">
                      <Phone className="h-3 w-3" /> {vendor.mobile}
                    </a>
                  ) : "—"}
                </Field>
                <Field label="Alternate Mobile">{vendor.alternateMobile || "—"}</Field>
                <Field label="Telephone">{vendor.telephone || "—"}</Field>
                <Field label="Website" className="col-span-2">
                  {vendor.website ? (
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-3 w-3" /> {vendor.website}
                    </a>
                  ) : "—"}
                </Field>
              </div>
            </div>
          )}

          {tab === "addresses" && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Primary Address</h4>
                <div className="text-sm">
                  {vendor.addressLine1 && <p>{vendor.addressLine1}</p>}
                  {vendor.addressLine2 && <p>{vendor.addressLine2}</p>}
                  {vendor.area && <p>{vendor.area}</p>}
                  <p>{[vendor.city, vendor.district].filter(Boolean).join(", ")}</p>
                  <p>{[vendor.state, vendor.postalCode].filter(Boolean).join(" ")}</p>
                  <p>{vendor.country || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "bank" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bank Name">{vendor.bankName || "—"}</Field>
              <Field label="Branch">{vendor.branch || "—"}</Field>
              <Field label="Account Holder">{vendor.accountHolder || "—"}</Field>
              <Field label="Account Number">{vendor.accountNumber || "—"}</Field>
              <Field label="IFSC">{vendor.ifsc || "—"}</Field>
              <Field label="SWIFT">{vendor.swift || "—"}</Field>
              <Field label="IBAN">{vendor.iban || "—"}</Field>
            </div>
          )}

          {tab === "tax" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="GSTIN">{vendor.gstNumber || "—"}</Field>
              <Field label="PAN">{vendor.panNumber || "—"}</Field>
              <Field label="Tax ID">{vendor.taxId || "—"}</Field>
              <Field label="MSME No.">{vendor.msmeNumber || "—"}</Field>
              <Field label="IEC">{vendor.importExportCode || "—"}</Field>
            </div>
          )}

          {tab === "purchases" && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingCart className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">Purchase history not available</p>
            </div>
          )}

          {tab === "ledger" && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">Ledger data not available</p>
            </div>
          )}

          {tab === "audit" && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Audit Trail</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Created By">{vendor.createdBy || "—"}</Field>
                <Field label="Created At">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "—"}</Field>
                <Field label="Updated By">{vendor.updatedBy || "—"}</Field>
                <Field label="Updated At">{vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : "—"}</Field>
                <Field label="Last Purchase">{vendor.lastPurchaseDate ? new Date(vendor.lastPurchaseDate).toLocaleDateString() : "—"}</Field>
                <Field label="Total Purchases">{vendor.totalPurchaseAmount != null ? `$${vendor.totalPurchaseAmount.toLocaleString()}` : "—"}</Field>
              </div>
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-4">
              {vendor.notes && (
                <div>
                  <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Notes</h4>
                  <p className="text-sm whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              )}
              {vendor.internalNotes && (
                <div>
                  <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Internal Notes</h4>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{vendor.internalNotes}</p>
                </div>
              )}
              {vendor.remarks && (
                <div>
                  <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">Remarks</h4>
                  <p className="text-sm whitespace-pre-wrap">{vendor.remarks}</p>
                </div>
              )}
              {!vendor.notes && !vendor.internalNotes && !vendor.remarks && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <StickyNote className="mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">No notes</p>
                </div>
              )}
            </div>
          )}

          {tab === "attachments" && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Paperclip className="mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">No attachments</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}