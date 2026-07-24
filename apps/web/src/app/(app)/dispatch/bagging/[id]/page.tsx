import { RecordDetailPage } from "@/components/record-detail-page";

export default function BagDetailPage() {
  return <RecordDetailPage title="Dispatch Bag" endpoint="/dispatch/bags" backHref="/dispatch/bagging" backLabel="bagging" />;
}
