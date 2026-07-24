import { RecordDetailPage } from "@/components/record-detail-page";

export default function InvoiceDetailPage() {
  return <RecordDetailPage title="Invoice" endpoint="/finance/invoices" backHref="/finance/invoices" backLabel="invoices" />;
}
