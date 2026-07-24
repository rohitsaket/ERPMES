import { RecordDetailPage } from "@/components/record-detail-page";

export default function JournalEntryDetailPage() {
  return <RecordDetailPage title="Journal Entry" endpoint="/finance/journal-entries" backHref="/finance/journal-entries" backLabel="journal entries" />;
}
