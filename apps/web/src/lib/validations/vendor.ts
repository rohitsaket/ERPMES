import { z } from "zod";

export const vendorStatuses = ["active", "inactive", "pending", "blocked", "blacklisted", "archived", "approved", "rejected"] as const;
export const vendorTypes = ["supplier", "manufacturer", "service_provider", "contractor", "consultant", "freelancer", "government", "non_profit", "other"] as const;
export const vendorCategories = ["raw_materials", "packaging", "equipment", "services", "transportation", "technology", "consulting", "maintenance", "other"] as const;
export const paymentTerms = ["immediate", "net_15", "net_30", "net_45", "net_60", "net_90", "due_on_receipt", "cod", "advance"] as const;
export const deliveryModes = ["air", "sea", "road", "rail", "courier", "hand_delivery", "digital"] as const;
export const currencies = ["USD", "EUR", "GBP", "INR", "AED", "SGD", "HKD", "JPY", "CNY", "CHF", "CAD", "AUD"] as const;
export const paymentMethods = ["bank_transfer", "check", "cash", "credit_card", "letter_of_credit", "online_payment"] as const;

export const vendorSchema = z.object({
  code: z.string().min(1, "Vendor code is required").max(20),
  name: z.string().min(1, "Vendor name is required").max(200),
  companyName: z.string().max(200).optional().or(z.literal("")),
  vendorType: z.enum(vendorTypes).optional(),
  category: z.enum(vendorCategories).optional(),
  vendorGroup: z.string().max(100).optional().or(z.literal("")),
  status: z.enum(vendorStatuses).default("active"),
  contactPerson: z.string().max(100).optional().or(z.literal("")),
  designation: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  mobile: z.string().regex(/^[+]?[\d\s()-]{7,20}$/, "Invalid mobile number").optional().or(z.literal("")),
  alternateMobile: z.string().regex(/^[+]?[\d\s()-]{7,20}$/, "Invalid mobile number").optional().or(z.literal("")),
  telephone: z.string().max(20).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  addressLine1: z.string().max(200).optional().or(z.literal("")),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  area: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  district: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  gstNumber: z.string().max(50).optional().or(z.literal("")),
  panNumber: z.string().max(20).optional().or(z.literal("")),
  taxId: z.string().max(50).optional().or(z.literal("")),
  msmeNumber: z.string().max(50).optional().or(z.literal("")),
  importExportCode: z.string().max(50).optional().or(z.literal("")),
  bankName: z.string().max(100).optional().or(z.literal("")),
  branch: z.string().max(100).optional().or(z.literal("")),
  accountHolder: z.string().max(100).optional().or(z.literal("")),
  accountNumber: z.string().max(50).optional().or(z.literal("")),
  ifsc: z.string().max(20).optional().or(z.literal("")),
  swift: z.string().max(20).optional().or(z.literal("")),
  iban: z.string().max(50).optional().or(z.literal("")),
  currency: z.enum(currencies).optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  paymentTerms: z.enum(paymentTerms).optional(),
  openingBalance: z.coerce.number().optional(),
  preferredPaymentMethod: z.enum(paymentMethods).optional(),
  leadTime: z.coerce.number().min(0).max(365).optional(),
  deliveryMode: z.enum(deliveryModes).optional(),
  preferredSupplier: z.boolean().optional(),
  qualityRating: z.coerce.number().min(0).max(5).optional(),
  notes: z.string().optional().or(z.literal("")),
  internalNotes: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  companyId: z.string().min(1, "Company is required"),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;
