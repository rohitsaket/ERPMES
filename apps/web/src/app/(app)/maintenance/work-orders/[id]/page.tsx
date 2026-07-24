import { RecordDetailPage } from "@/components/record-detail-page";

export default function WorkOrderDetailPage() {
  return <RecordDetailPage title="Maintenance Work Order" endpoint="/maintenance/work-orders" backHref="/maintenance/work-orders" backLabel="work orders" />;
}
