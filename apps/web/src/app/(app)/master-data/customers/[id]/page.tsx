import { RecordDetailPage } from "@/components/record-detail-page";

export default function CustomerDetailPage() {
  return <RecordDetailPage title="Customer" endpoint="/customers" backHref="/master-data/customers" backLabel="customers" />;
}
