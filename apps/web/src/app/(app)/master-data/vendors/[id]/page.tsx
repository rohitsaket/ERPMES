import { RecordDetailPage } from "@/components/record-detail-page";

export default function VendorDetailPage() {
  return <RecordDetailPage title="Vendor" endpoint="/vendors" backHref="/master-data/vendors" backLabel="vendors" />;
}
