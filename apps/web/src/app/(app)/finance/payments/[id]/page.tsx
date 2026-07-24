import { RecordDetailPage } from "@/components/record-detail-page";

export default function PaymentDetailPage() {
  return <RecordDetailPage title="Payment" endpoint="/finance/payments" backHref="/finance/payments" backLabel="payments" />;
}
