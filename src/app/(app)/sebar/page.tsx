import { ensureSheetStructure, getGuests, getSettings } from "@/lib/sheets";
import SebarClient from "@/components/SebarClient";

export default async function SebarPage() {
  await ensureSheetStructure();
  const [guests, settings] = await Promise.all([getGuests(), getSettings()]);

  return <SebarClient initialGuests={guests} initialTemplate={settings.template_pesan} baseLink={settings.base_link} />;
}
