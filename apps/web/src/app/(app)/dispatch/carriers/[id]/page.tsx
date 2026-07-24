import { RecordDetailPage } from "@/components/record-detail-page";

export default function CarrierDetailPage() {
  return <RecordDetailPage title="Carrier" endpoint="/dispatch/carriers" backHref="/dispatch/carriers" backLabel="carriers" />;
}
