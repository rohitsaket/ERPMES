import { redirect } from "next/navigation";

export default function RequisitionsRedirectPage() {
  redirect("/procurement/purchase-requisitions");
  return null;
}
