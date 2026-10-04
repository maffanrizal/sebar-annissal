import { ensureSheetStructure, getWishes } from "@/lib/sheets";
import UcapanClient from "@/components/UcapanClient";

export default async function UcapanPage() {
  await ensureSheetStructure();
  const wishes = await getWishes();

  return <UcapanClient wishes={wishes} />;
}
