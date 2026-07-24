import { RecordDetailPage } from "@/components/record-detail-page";

export default function WorkCenterDetailPage() {
  return <RecordDetailPage title="Work Center" endpoint="/work-centers" backHref="/master-data/work-centers" backLabel="work centers" />;
}
