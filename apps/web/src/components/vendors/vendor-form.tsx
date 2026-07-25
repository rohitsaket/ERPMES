"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Vendor } from "@/lib/api/types";
import { vendorSchema, type VendorFormValues, vendorTypes, vendorCategories, paymentTerms, currencies, deliveryModes, paymentMethods, vendorStatuses } from "@/lib/validations/vendor";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Save, Building2, Contact, MapPin, Receipt, CreditCard, DollarSign, Briefcase, Paperclip, StickyNote, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

export default function VendorFormPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("general");

  const form = useForm<VendorFormValues>({
    defaultValues: {
      code: "",
      name: "",
      companyName: "",
      status: "active",
      companyId: "default",
      preferredSupplier: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: VendorFormValues) => api.post<Vendor>("/vendors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      router.push("/master-data/vendors");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const payload = { ...data, tags: data.tags || undefined };
    mutation.mutate(payload);
  });

  const section = (id: string, title: string, content: React.ReactNode) => (
    <Card id={id} className={cn("scroll-mt-4", activeSection === id && "ring-1 ring-primary/20")}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className={id === "notes" ? "space-y-4" : "grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2 lg:grid-cols-3"}>
        {content}
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/master-data/vendors"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">New Vendor</h1>
              <p className="text-muted-foreground">Add a new vendor to your procurement network</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/master-data/vendors"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Vendor</>}
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            <nav className="hidden w-52 shrink-0 lg:block">
              <div className="sticky top-4 space-y-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(s.id);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors",
                      activeSection === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>
            </nav>

            <div className="min-w-0 flex-1 space-y-6">
              {mutation.isError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {mutation.error instanceof Error ? mutation.error.message : "Failed to create vendor"}
                </div>
              )}

              {section("general", "General Information", <>
                <Field form={form} name="code" label="Vendor Code *" placeholder="Auto-generated or enter manually" />
                <Field form={form} name="name" label="Vendor Name *" placeholder="e.g. Diamond World Ltd." />
                <Field form={form} name="companyName" label="Company Name" placeholder="Legal name if different" />
                <SelectField form={form} name="vendorType" label="Vendor Type" options={vendorTypes} placeholder="Select type" />
                <SelectField form={form} name="category" label="Category" options={vendorCategories} placeholder="Select category" />
                <Field form={form} name="vendorGroup" label="Vendor Group" placeholder="e.g. Strategic, Regular" />
                <SelectField form={form} name="status" label="Status" options={vendorStatuses} placeholder="Select status" />
              </>)}

              <Separator />

              {section("contact", "Contact Information", <>
                <Field form={form} name="contactPerson" label="Primary Contact" placeholder="Full name" />
                <Field form={form} name="designation" label="Designation" placeholder="e.g. Procurement Manager" />
                <Field form={form} name="email" label="Email" type="email" placeholder="contact@vendor.com" />
                <Field form={form} name="mobile" label="Mobile" placeholder="e.g. +1-234-567-8900" />
                <Field form={form} name="alternateMobile" label="Alternate Mobile" placeholder="e.g. +1-234-567-8901" />
                <Field form={form} name="telephone" label="Telephone" placeholder="e.g. +1-234-567-8900" />
                <Field form={form} name="website" label="Website" type="url" placeholder="https://vendor.com" className="md:col-span-2 lg:col-span-3" />
              </>)}

              <Separator />

              {section("address", "Address", <>
                <Field form={form} name="addressLine1" label="Address Line 1" placeholder="Building/Street" className="md:col-span-2 lg:col-span-3" />
                <Field form={form} name="addressLine2" label="Address Line 2" placeholder="Area/Locality" className="md:col-span-2 lg:col-span-3" />
                <Field form={form} name="area" label="Area" placeholder="e.g. Industrial Area" />
                <Field form={form} name="city" label="City" placeholder="e.g. Mumbai" />
                <Field form={form} name="district" label="District" placeholder="e.g. Mumbai Suburban" />
                <Field form={form} name="state" label="State" placeholder="e.g. Maharashtra" />
                <Field form={form} name="country" label="Country" placeholder="e.g. India" />
                <Field form={form} name="postalCode" label="Postal Code" placeholder="e.g. 400001" />
              </>)}

              <Separator />

              {section("tax", "Tax Information", <>
                <Field form={form} name="gstNumber" label="GST Number" placeholder="e.g. 27AABCU9603R1ZX" />
                <Field form={form} name="panNumber" label="PAN Number" placeholder="e.g. AABCU9603R" />
                <Field form={form} name="taxId" label="Tax ID" placeholder="e.g. TAX-12345" />
                <Field form={form} name="msmeNumber" label="MSME Number" placeholder="e.g. UDYAM-XX-00-0000000" />
                <Field form={form} name="importExportCode" label="Import Export Code" placeholder="e.g. IEC-1234567890" />
              </>)}

              <Separator />

              {section("bank", "Bank Information", <>
                <Field form={form} name="bankName" label="Bank Name" placeholder="e.g. HDFC Bank" />
                <Field form={form} name="branch" label="Branch" placeholder="e.g. Andheri East" />
                <Field form={form} name="accountHolder" label="Account Holder" placeholder="As per bank records" />
                <Field form={form} name="accountNumber" label="Account Number" placeholder="e.g. 12345678901" />
                <Field form={form} name="ifsc" label="IFSC Code" placeholder="e.g. HDFC0001234" />
                <Field form={form} name="swift" label="SWIFT Code" placeholder="e.g. HDFCINBB" />
                <Field form={form} name="iban" label="IBAN" placeholder="e.g. DE89370400440532013000" />
              </>)}

              <Separator />

              {section("financial", "Financial Details", <>
                <SelectField form={form} name="currency" label="Currency" options={currencies} placeholder="Select currency" />
                <Field form={form} name="creditLimit" label="Credit Limit" type="number" placeholder="e.g. 50000" />
                <SelectField form={form} name="paymentTerms" label="Payment Terms" options={paymentTerms} placeholder="Select terms" />
                <Field form={form} name="openingBalance" label="Opening Balance" type="number" placeholder="e.g. 0" />
                <SelectField form={form} name="preferredPaymentMethod" label="Payment Method" options={paymentMethods} placeholder="Select method" />
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="preferredSupplier" {...form.register("preferredSupplier")} className="h-4 w-4 rounded border-gray-300" />
                  <Label htmlFor="preferredSupplier" className="text-sm font-normal">Mark as preferred supplier</Label>
                </div>
              </>)}

              <Separator />

              {section("business", "Business Information", <>
                <Field form={form} name="leadTime" label="Lead Time (days)" type="number" placeholder="e.g. 15" />
                <SelectField form={form} name="deliveryMode" label="Delivery Mode" options={deliveryModes} placeholder="Select mode" />
                <Field form={form} name="qualityRating" label="Quality Rating (0–5)" type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" />
              </>)}

              <Separator />

              {section("attachments", "Attachments", <>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center md:col-span-2 lg:col-span-3">
                  <Paperclip className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drag & drop files here</p>
                  <p className="text-xs text-muted-foreground">GST Certificate, PAN Card, Bank Proof, Agreement, ISO Certificates</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3">Browse Files</Button>
                </div>
              </>)}

              <Separator />

              <Card id="notes">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-semibold">Notes & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <Field form={form} name="tags" label="Tags (comma separated)" placeholder="e.g. strategic, international, certified" className="md:col-span-2 lg:col-span-3" />
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3 pb-8">
                <Link href="/master-data/vendors"><Button type="button" variant="outline">Cancel</Button></Link>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Vendor</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ form, name, label, type, placeholder, className, step, min, max }: { form: any; name: string; label: string; type?: string; placeholder?: string; className?: string; step?: string; min?: string; max?: string }) {
  const err = form.formState.errors[name];
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={name} className="text-xs font-medium">{label}</Label>
      <Input id={name} type={type || "text"} step={step} min={min} max={max} {...form.register(name, { valueAsNumber: type === "number" })} placeholder={placeholder} className={cn("h-9 text-sm", err && "border-red-500")} />
      {err && <p className="text-xs text-red-500">{err.message as string}</p>}
    </div>
  );
}

function SelectField({ form, name, label, options, placeholder }: { form: any; name: string; label: string; options: readonly string[]; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-medium">{label}</Label>
      <Select value={form.watch(name)} onValueChange={(v) => form.setValue(name, v, { shouldValidate: true })}>
        <SelectTrigger id={name} className="h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {form.formState.errors[name] && <p className="text-xs text-red-500">{form.formState.errors[name].message as string}</p>}
    </div>
  );
}
