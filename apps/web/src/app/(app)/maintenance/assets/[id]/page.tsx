import { RecordDetailPage } from "@/components/record-detail-page";

export default function AssetDetailPage() {
  return <RecordDetailPage title="Asset" endpoint="/maintenance/assets" backHref="/maintenance/assets" backLabel="assets" />;
}
