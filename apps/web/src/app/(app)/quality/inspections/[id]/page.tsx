import { RecordDetailPage } from "@/components/record-detail-page";

export default function InspectionDetailPage() {
  return <RecordDetailPage title="Inspection" endpoint="/quality/inspections" backHref="/quality/inspections" backLabel="inspections" />;
}
