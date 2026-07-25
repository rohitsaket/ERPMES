"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, UploadCloud, FileDown, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export function VendorImportDialog({ open, onClose, onImportSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!open) return null;

  const handleDownloadTemplate = () => {
    // Generate simple CSV template
    const headers = "Code,Name,Company Name,Vendor Type,Category,Contact Person,Email,Mobile,City,State,Country,GST Number,Status,Rating,Payment Terms";
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vendor_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "Fill this template and upload it back to import vendors.",
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0] || null);
    }
  };

  const handleImport = () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setFile(null);
      toast({
        title: "Import Successful",
        description: `${file.name} has been processed successfully.`,
      });
      if (onImportSuccess) {
        onImportSuccess();
      }
      onClose();
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;
      
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (validTypes.includes(droppedFile.type) || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a valid .csv or .xlsx file.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={!isUploading ? onClose : undefined} />
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl border bg-background p-6 shadow-lg sm:max-w-[500px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Import Vendors</h2>
            <p className="text-sm text-muted-foreground">Upload a CSV or Excel file to bulk import vendors.</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} disabled={isUploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download our standard CSV format.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} disabled={isUploading}>
              <FileDown className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <div 
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-10 transition-colors hover:bg-muted/40"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium text-center">
              {file ? file.name : "Drag and drop your file here"}
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              {file ? "File selected" : "Supports .csv, .xlsx, .xls"}
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Browse Files
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv, .xlsx, .xls"
              onChange={handleFileSelect}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || isUploading} className="min-w-[100px]">
              {isUploading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
