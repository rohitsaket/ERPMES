import { RecordDetailPage } from "@/components/record-detail-page";

export default function ReturnAuthorizationDetailPage() {
  return <RecordDetailPage title="Return Authorization" endpoint="/returns/authorizations" backHref="/returns/authorizations" backLabel="return authorizations" />;
}
