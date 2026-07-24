import { RecordDetailPage } from "@/components/record-detail-page";

export default function InspectionPlanDetailPage() {
  return <RecordDetailPage title="Inspection Plan" endpoint="/quality/inspection-plans" backHref="/quality/inspection-plans" backLabel="inspection plans" />;
}
