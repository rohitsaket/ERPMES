import { RecordDetailPage } from "@/components/record-detail-page";

export default function RepairOrderDetailPage() {
  return <RecordDetailPage title="Repair Order" endpoint="/returns/repair-orders" backHref="/returns/repair-orders" backLabel="repair orders" />;
}
