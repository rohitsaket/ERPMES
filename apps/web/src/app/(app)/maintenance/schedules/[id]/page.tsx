import { RecordDetailPage } from "@/components/record-detail-page";

export default function ScheduleDetailPage() {
  return <RecordDetailPage title="Preventive Maintenance Schedule" endpoint="/maintenance/schedules" backHref="/maintenance/schedules" backLabel="maintenance schedules" />;
}
