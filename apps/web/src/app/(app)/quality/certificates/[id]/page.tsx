import { RecordDetailPage } from "@/components/record-detail-page";

export default function CertificateDetailPage() {
  return <RecordDetailPage title="Certificate" endpoint="/quality/certificates" backHref="/quality/certificates" backLabel="certificates" />;
}
