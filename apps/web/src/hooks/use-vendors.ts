import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Vendor, VendorQuery, VendorFormData } from "@/lib/api/types";

export function useVendors(query: VendorQuery) {
  return useQuery({
    queryKey: ["vendors", query],
    queryFn: () => api.get<{ data: Vendor[]; meta: { page: number; limit: number; total: number; totalPages: number } }>("/vendors", query as Record<string, string | number | undefined>),
    placeholderData: (prev) => prev,
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => api.get<Vendor>(`/vendors/${id}`),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorFormData) => api.post<Vendor>("/vendors", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useUpdateVendor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<VendorFormData>) => api.put<Vendor>(`/vendors/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendors"] }); qc.invalidateQueries({ queryKey: ["vendor", id] }); },
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendors/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useVendorDashboard(companyId: string = "cm6am27400000a6eogbmm7j3p") {
  return useQuery({
    queryKey: ["vendors-dashboard", companyId],
    queryFn: () => api.get<{ total: number; active: number; pending: number; inactive: number; blocked: number }>(`/vendors/dashboard?companyId=${companyId}`),
  });
}

export function useVendorCategories(companyId: string = "cm6am27400000a6eogbmm7j3p") {
  return useQuery({
    queryKey: ["vendors-categories", companyId],
    queryFn: () => api.get<Array<{ id: string; name: string; count: number; percent: number }>>(`/vendors/categories/top?companyId=${companyId}`),
  });
}

export function useTopVendors(companyId: string = "cm6am27400000a6eogbmm7j3p") {
  return useQuery({
    queryKey: ["vendors-top", companyId],
    queryFn: () => api.get<Array<{ id: string; name: string; amount: string }>>(`/vendors/top?companyId=${companyId}`),
  });
}
