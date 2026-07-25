"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { VendorDataGrid } from "@/components/vendors/vendor-data-grid";
import { VendorToolbar } from "@/components/vendors/vendor-toolbar";
import { VendorPagination } from "@/components/vendors/vendor-pagination";
import { VendorEmptyState } from "@/components/vendors/vendor-empty-state";
import { VendorDrawer } from "@/components/vendors/vendor-drawer";
import { NewVendorDrawer } from "@/components/vendors/new-vendor-drawer";
import { VendorImportDialog } from "@/components/vendors/vendor-import-dialog";
import { VendorInsights } from "@/components/vendors/vendor-insights";
import { VendorKPICards } from "@/components/vendors/vendor-kpi-cards";
import { useVendors } from "@/hooks/use-vendors";
import type { Vendor, VendorQuery } from "@/lib/api/types";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [density, setDensity] = useState<"compact" | "normal" | "comfortable">("normal");
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    select: true,
    code: true,
    name: true,
    vendorType: true,
    category: true,
    city: true,
    gstNumber: true,
    currency: true,
    paymentTerms: true,
    creditLimit: true,
    outstandingBalance: true,
    status: true,
    rating: true,
    createdAt: true,
    actions: true,
  });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVendor, setDrawerVendor] = useState<Vendor | null>(null);
  const [newVendorDrawerOpen, setNewVendorDrawerOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const query: VendorQuery = {
    page,
    limit: pageSize,
    search: search || undefined,
  };

  const { data, isLoading, error, refetch } = useVendors(query);
  const vendors = data?.data ?? [];
  const meta = data?.meta;

  const handleRowClick = useCallback((vendor: Vendor) => {
    setDrawerVendor(vendor);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((vendor: Vendor) => {
    // Navigate to edit page
  }, []);

  const handleDelete = useCallback((vendor: Vendor) => {
    if (confirm(`Delete vendor "${vendor.name}"?`)) {
      // Delete action would go here
    }
  }, []);

  const { toast } = useToast();

  const handleNewVendor = useCallback(() => {
    setNewVendorDrawerOpen(true);
  }, []);

  const handleImport = useCallback(() => {
    setImportDialogOpen(true);
  }, []);

  const handleExportCsv = useCallback(async () => {
    try {
      toast({ title: "Exporting...", description: "Downloading vendor data..." });
      // Constructing query string for export using same search state
      const qs = new URLSearchParams({ page: "1", limit: "10000" });
      if (search) qs.append("search", search);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/vendors/export?${qs.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth if applicable
        }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded successfully.",
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "An error occurred during export.",
        variant: "destructive",
      });
    }
  }, [search, toast]);

  const handleExportExcel = useCallback(() => {
    if (!vendors || vendors.length === 0) {
      toast({ title: "Export Failed", description: "No data to export", variant: "destructive" });
      return;
    }
    
    toast({ title: "Exporting...", description: "Generating Excel file..." });
    
    const data = vendors.map(v => ({
      Code: v.code,
      Name: v.name,
      "Company Name": v.companyName || '-',
      Type: v.vendorType || '-',
      Category: v.category || '-',
      "Contact Person": v.contactPerson || '-',
      Email: v.email || '-',
      Mobile: v.mobile || '-',
      City: v.city || '-',
      State: v.state || '-',
      Country: v.country || '-',
      "GST Number": v.gstNumber || '-',
      Status: v.status || '-',
      Rating: v.rating || '-',
      "Payment Terms": v.paymentTerms || '-'
    }));

    // @ts-ignore
    import('xlsx').then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");
      XLSX.writeFile(workbook, `vendors_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: "Export Successful", description: "Excel file has been downloaded." });
    }).catch(() => {
      toast({ title: "Error", description: "Failed to load Excel export module", variant: "destructive" });
    });
  }, [vendors, toast]);

  const handleExportPdf = useCallback(() => {
    if (!vendors || vendors.length === 0) {
      toast({ title: "Export Failed", description: "No data to export", variant: "destructive" });
      return;
    }
    
    toast({ title: "Exporting...", description: "Generating PDF file..." });

    // @ts-ignore
    import('jspdf').then((jsPDFModule) => {
      // @ts-ignore
      import('jspdf-autotable').then((autoTableModule) => {
        const jsPDF = jsPDFModule.default || jsPDFModule;
        const autoTable = autoTableModule.default || (autoTableModule as any).applyPlugin || autoTableModule;
        
        const doc = new (jsPDF as any)();
        
        doc.setFontSize(14);
        doc.text("Vendor Directory", 14, 15);
        doc.setFontSize(9);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        const tableData = vendors.map(v => [
          v.code || '-', 
          v.name || '-', 
          (v.vendorType || '-').replace(/_/g, ' '), 
          v.city || '-', 
          v.country || '-', 
          v.status || '-'
        ]);

        (doc as any).autoTable({
          startY: 28,
          head: [['Code', 'Name', 'Type', 'City', 'Country', 'Status']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });

        doc.save(`vendors_export_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({ title: "Export Successful", description: "PDF file has been downloaded." });
      }).catch(err => console.error(err));
    }).catch(() => {
      toast({ title: "Error", description: "Failed to load PDF export module", variant: "destructive" });
    });
  }, [vendors, toast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSettings = useCallback(() => {
    toast({
      title: "Vendor Settings",
      description: "Settings panel is currently under construction.",
    });
  }, [toast]);

  return (
      <div className="flex flex-col p-4 md:p-6 h-full min-h-0 overflow-y-auto bg-[#F8FAFC]">
        
        {/* Main Content Layout */}
        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
          
          {/* Left / Center Area: Toolbar, KPIs, Table */}
          <div className="flex-1 flex flex-col min-w-0 gap-5">
            
            {/* Toolbar */}
            <div className="bg-white border rounded-xl shadow-sm p-2 shrink-0">
              <VendorToolbar
                search={search}
                onSearchChange={setSearch}
                density={density}
                onDensityChange={setDensity}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onRefresh={() => refetch()}
                onImport={handleImport}
                onExportCsv={handleExportCsv}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onPrint={handlePrint}
                onSettings={handleSettings}
                onNewVendor={handleNewVendor}
              />
            </div>

            {/* KPI Cards */}
            <div className="shrink-0">
              <VendorKPICards />
            </div>

            {/* Table Container */}
            <div className="flex-1 flex flex-col min-h-[400px] bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="flex-1 overflow-hidden">
                {isLoading ? (
                  <VendorDataGrid
                    data={[]}
                    total={0}
                    page={1}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onRowClick={handleRowClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={true}
                    selectedRows={new Set()}
                    onSelectedRowsChange={setSelectedRows}
                    density={density}
                    columnVisibility={columnVisibility}
                    onColumnVisibilityChange={setColumnVisibility}
                  />
                ) : error ? (
                  <div className="h-full flex items-center justify-center p-6 text-red-600">
                    Failed to load vendors
                  </div>
                ) : !vendors.length ? (
                  <VendorEmptyState hasFilters={!!search} />
                ) : (
                  <div className="h-full flex flex-col">
                    <VendorDataGrid
                      data={vendors}
                      total={meta?.total ?? 0}
                      page={page}
                      pageSize={pageSize}
                      onPageChange={setPage}
                      onPageSizeChange={setPageSize}
                      onRowClick={handleRowClick}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isLoading={false}
                      selectedRows={selectedRows}
                      onSelectedRowsChange={setSelectedRows}
                      density={density}
                      columnVisibility={columnVisibility}
                      onColumnVisibilityChange={setColumnVisibility}
                    />
                    {meta && meta.totalPages > 1 && (
                      <div className="border-t p-3 mt-auto bg-slate-50/50">
                        <VendorPagination
                          page={page}
                          pageSize={pageSize}
                          total={meta.total}
                          totalPages={meta.totalPages}
                          selectedCount={selectedRows.size}
                          onPageChange={setPage}
                          onPageSizeChange={setPageSize}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Insights Sidebar */}
          <VendorInsights 
            onImport={handleImport}
            onExport={handleExportCsv}
          />
        </div>

        <VendorDrawer
          vendor={drawerVendor}
          open={drawerOpen}
          onClose={() => { setDrawerOpen(false); setDrawerVendor(null); }}
        />
        <NewVendorDrawer
          isOpen={newVendorDrawerOpen}
          onClose={() => setNewVendorDrawerOpen(false)}
        />
        <VendorImportDialog 
          open={importDialogOpen} 
          onClose={() => setImportDialogOpen(false)} 
          onImportSuccess={refetch} 
        />
      </div>
  );
}