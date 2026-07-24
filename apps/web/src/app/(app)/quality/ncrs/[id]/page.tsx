import { RecordDetailPage } from "@/components/record-detail-page";

export default function NcrDetailPage() {
  return <RecordDetailPage title="Nonconformance Report" endpoint="/quality/ncrs" backHref="/quality/ncrs" backLabel="nonconformance reports" />;
}
