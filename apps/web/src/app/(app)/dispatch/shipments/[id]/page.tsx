import { RecordDetailPage } from "@/components/record-detail-page";

export default function ShipmentDetailPage() {
  return <RecordDetailPage title="Shipment" endpoint="/dispatch/shipments" backHref="/dispatch/shipments" backLabel="shipments" />;
}
