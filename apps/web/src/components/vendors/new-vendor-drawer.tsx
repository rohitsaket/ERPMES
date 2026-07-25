"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Vendor } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Save, X, Building2, Contact, MapPin, Receipt, CreditCard, DollarSign, Briefcase, Paperclip, StickyNote, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const VENDOR_TYPES = ["supplier", "manufacturer", "service_provider", "contractor", "consultant", "freelancer", "government", "non_profit", "other"];
const VENDOR_CATEGORIES = ["raw_materials", "packaging", "equipment", "services", "transportation", "technology", "consulting", "maintenance", "other"];
const VENDOR_STATUSES = ["active", "inactive", "pending", "blocked", "blacklisted", "archived", "approved", "rejected"];
const PAYMENT_TERMS = ["immediate", "net_15", "net_30", "net_45", "net_60", "net_90", "due_on_receipt", "cod", "advance"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "SGD", "HKD", "JPY", "CNY", "CHF", "CAD", "AUD"];
const PAYMENT_METHODS = ["bank_transfer", "check", "cash", "credit_card", "letter_of_credit", "online_payment"];
const DELIVERY_MODES = ["air", "sea", "road", "rail", "courier", "hand_delivery", "digital"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewVendorDrawer({ isOpen, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("general");

  useEffect(() => {
    if (isOpen) setActiveSection("general");
  }, [isOpen]);

  const form = useForm({
    defaultValues: {
      code: "",
      name: "",
      companyName: "",
      status: "active",
      vendorType: "",
      category: "",
      vendorGroup: "",
      contactPerson: "",
      designation: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      telephone: "",
      website: "",
      addressLine1: "",
      addressLine2: "",
      area: "",
      city: "",
      district: "",
      state: "",
      country: "",
      postalCode: "",
      gstNumber: "",
      panNumber: "",
      taxId: "",
      msmeNumber: "",
      importExportCode: "",
      bankName: "",
      branch: "",
      accountHolder: "",
      accountNumber: "",
      ifsc: "",
      swift: "",
      iban: "",
      currency: "USD",
      creditLimit: 0,
      paymentTerms: "",
      openingBalance: 0,
      preferredPaymentMethod: "",
      leadTime: 0,
      deliveryMode: "",
      preferredSupplier: false,
      qualityRating: 0,
      notes: "",
      internalNotes: "",
      remarks: "",
      tags: "",
      companyId: "default",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post<Vendor>("/vendors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      form.reset();
      onClose();
      onSuccess?.();
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const payload = { ...data, tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : undefined };
    mutation.mutate(payload);
  });

  const SECTIONS = [
    { id: "general", label: "General Information", icon: Building2 },
    { id: "contact", label: "Contact Information", icon: Contact },
    { id: "address", label: "Address", icon: MapPin },
    { id: "tax", label: "Tax Information", icon: Receipt },
    { id: "bank", label: "Bank Information", icon: CreditCard },
    { id: "financial", label: "Financial", icon: DollarSign },
    { id: "business", label: "Business Information", icon: Briefcase },
    { id: "attachments", label: "Attachments", icon: Paperclip },
    { id: "notes", label: "Notes & Tags", icon: StickyNote },
    { id: "audit", label: "Audit", icon: Shield },
  ];

  if (!isOpen) return null;

  const renderSection = (id: string) => {
    switch (id) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field form={form} name="code" label="Vendor Code *" placeholder="Auto-generated or enter manually" required />
              <Field form={form} name="name" label="Vendor Name *" placeholder="e.g. Diamond World Ltd." required />
              <Field form={form} name="companyName" label="Company Name" placeholder="Legal name if different" />
              <SelectField form={form} name="vendorType" label="Vendor Type" options={VENDOR_TYPES} placeholder="Select type" />
              <SelectField form={form} name="category" label="Category" options={VENDOR_CATEGORIES} placeholder="Select category" />
              <Field form={form} name="vendorGroup" label="Vendor Group" placeholder="e.g. Strategic, Regular" />
              <SelectField form={form} name="status" label="Status" options={VENDOR_STATUSES} placeholder="Select status" />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField form={form} name="currency" label="Currency" options={CURRENCIES} placeholder="Select currency" />
              <SelectField form={form} name="paymentTerms" label="Payment Terms" options={PAYMENT_TERMS} placeholder="Select terms" />
              <Field form={form} name="creditLimit" label="Credit Limit" type="number" placeholder="e.g. 50000" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="preferredSupplier" {...form.register("preferredSupplier")} className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="preferredSupplier" className="text-sm font-normal">Mark as preferred supplier</Label>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field form={form} name="contactPerson" label="Primary Contact" placeholder="Full name" />
              <Field form={form} name="designation" label="Designation" placeholder="e.g. Procurement Manager" />
              <Field form={form} name="email" label="Email" type="email" placeholder="contact@vendor.com" />
              <Field form={form} name="mobile" label="Mobile" placeholder="e.g. +1-234-567-8900" />
              <Field form={form} name="alternateMobile" label="Alternate Mobile" placeholder="e.g. +1-234-567-8901" />
              <Field form={form} name="telephone" label="Telephone" placeholder="e.g. +1-234-567-8900" />
              <Field form={form} name="website" label="Website" type="url" placeholder="https://vendor.com" className="md:col-span-2" />
            </div>
          </div>
        );
      case "address":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field form={form} name="addressLine1" label="Address Line 1" placeholder="Building/Street" className="md:col-span-2" />
              <Field form={form} name="addressLine2" label="Address Line 2" placeholder="Area/Locality" className="md:col-span-2" />
              <Field form={form} name="area" label="Area" placeholder="e.g. Industrial Area" />
              <Field form={form} name="city" label="City" placeholder="e.g. Mumbai" />
              <Field form={form} name="district" label="District" placeholder="e.g. Mumbai Suburban" />
              <Field form={form} name="state" label="State" placeholder="e.g. Maharashtra" />
              <Field form={form} name="country" label="Country" placeholder="e.g. India" />
              <Field form={form} name="postalCode" label="Postal Code" placeholder="e.g. 400001" />
            </div>
          </div>
        );
      case "tax":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Field form={form} name="gstNumber" label="GST Number" placeholder="e.g. 27AABCU9603R1ZX" />
            <Field form={form} name="panNumber" label="PAN Number" placeholder="e.g. AABCU9603R" />
            <Field form={form} name="taxId" label="Tax ID" placeholder="e.g. TAX-12345" />
            <Field form={form} name="msmeNumber" label="MSME Number" placeholder="e.g. UDYAM-XX-00-0000000" />
            <Field form={form} name="importExportCode" label="Import Export Code" placeholder="e.g. IEC-1234567890" />
          </div>
        );
      case "bank":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Field form={form} name="bankName" label="Bank Name" placeholder="e.g. HDFC Bank" />
            <Field form={form} name="branch" label="Branch" placeholder="e.g. Andheri East" />
            <Field form={form} name="accountHolder" label="Account Holder" placeholder="As per bank records" />
            <Field form={form} name="accountNumber" label="Account Number" placeholder="e.g. 12345678901" />
            <Field form={form} name="ifsc" label="IFSC Code" placeholder="e.g. HDFC0001234" />
            <Field form={form} name="swift" label="SWIFT Code" placeholder="e.g. HDFCINBB" />
            <Field form={form} name="iban" label="IBAN" placeholder="e.g. DE89370400440532013000" />
          </div>
        );
      case "financial":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Field form={form} name="creditLimit" label="Credit Limit" type="number" placeholder="e.g. 50000" />
            <SelectField form={form} name="paymentTerms" label="Payment Terms" options={PAYMENT_TERMS} placeholder="Select terms" />
            <Field form={form} name="openingBalance" label="Opening Balance" type="number" placeholder="e.g. 0" />
            <SelectField form={form} name="preferredPaymentMethod" label="Payment Method" options={PAYMENT_METHODS} placeholder="Select method" />
          </div>
        );
      case "business":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Field form={form} name="leadTime" label="Lead Time (days)" type="number" placeholder="e.g. 15" />
            <SelectField form={form} name="deliveryMode" label="Delivery Mode" options={DELIVERY_MODES} placeholder="Select mode" />
            <Field form={form} name="qualityRating" label="Quality Rating (0–5)" type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" />
          </div>
        );
      case "attachments":
        return (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
            <Paperclip className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground">GST Certificate, PAN Card, Bank Proof, Agreement, ISO Certificates</p>
            <Button type="button" variant="outline" size="sm" className="mt-3">Browse Files</Button>
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea {...form.register("notes")} placeholder="General notes about this vendor..." className="min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea {...form.register("internalNotes")} placeholder="Internal notes (not visible to vendor)..." className="min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea {...form.register("remarks")} placeholder="Additional remarks..." className="min-h-[60px]" />
            </div>
            <Field form={form} name="tags" label="Tags (comma separated)" placeholder="e.g. strategic, international, certified" className="md:col-span-3" />
          </div>
        );
      case "audit":
        return (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Created By: —</p>
            <p>Created At: —</p>
            <p>Updated By: —</p>
            <p>Updated At: —</p>
            <p>Last Purchase: —</p>
            <p>Total Purchases: —</p>
            <p>Last Login (Vendor Portal): —</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 w-full max-w-4xl h-screen bg-background shadow-xl flex flex-col lg:translate-x-0 animate-in slide-in-from-right">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">New Vendor</h2>
              <p className="text-xs text-muted-foreground">Add a new vendor to your procurement network</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-0 overflow-x-auto border-b px-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
                activeSection === s.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={onSubmit}>
            {renderSection(activeSection)}
            <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Vendor
                  </>
                )}
              </Button>
            </div>
          </form>

          {mutation.isError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to create vendor"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ form, name, label, type, placeholder, className, required, step, min, max }: any) {
  const err = form.formState.errors[name];
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-xs font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Input
        id={name}
        type={type || "text"}
        step={step}
        min={min}
        max={max}
        {...form.register(name, { valueAsNumber: type === "number" })}
        placeholder={placeholder}
        className={cn("h-9 text-sm", err && "border-red-500")}
      />
      {err && <p className="text-xs text-red-500">{err.message as string}</p>}
    </div>
  );
}

function SelectField({ form, name, label, options, placeholder }: { form: any; name: string; label: string; options: readonly string[]; placeholder?: string }) {
  const err = form.formState.errors[name];
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-medium">{label}</Label>
      <Select value={form.watch(name)} onValueChange={(v) => form.setValue(name, v, { shouldValidate: true })}>
        <SelectTrigger id={name} className={cn("h-9 text-sm", err && "border-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {err && <p className="text-xs text-red-500">{err.message as string}</p>}
    </div>
  );
}