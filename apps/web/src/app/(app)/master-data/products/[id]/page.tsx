import { RecordDetailPage } from "@/components/record-detail-page";

export default function ProductDetailPage() {
  return <RecordDetailPage title="Product" endpoint="/products" backHref="/master-data/products" backLabel="products" />;
}
