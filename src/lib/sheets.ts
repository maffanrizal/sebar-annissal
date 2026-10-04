import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import type { Guest, Wish, Settings } from "./types";

const SHEET_ID = process.env.GOOGLE_SHEET_ID as string;

const GUESTS_TAB = "Guests";
const WISHES_TAB = "Wishes";
const SETTINGS_TAB = "Settings";

let cachedClient: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Vercel env vars collapse literal "\n" in the private key back to real newlines.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key || !SHEET_ID) {
    throw new Error(
      "Konfigurasi Google Sheets belum lengkap. Cek GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID."
    );
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

const GUESTS_HEADER = ["id", "nama_tamu", "status_kirim", "created_at"];
const WISHES_HEADER = ["id", "nama_tamu", "kehadiran", "pesan", "created_at"];
const SETTINGS_HEADER = ["key", "value"];

/**
 * Creates the three tabs with headers if they don't already exist.
 * Safe to call on every cold start; checks before writing.
 */
export async function ensureSheetStructure(): Promise<void> {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingTabs = new Set(
    (meta.data.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  );

  const requests: sheets_v4.Schema$Request[] = [];
  if (!existingTabs.has(GUESTS_TAB)) {
    requests.push({ addSheet: { properties: { title: GUESTS_TAB } } });
  }
  if (!existingTabs.has(WISHES_TAB)) {
    requests.push({ addSheet: { properties: { title: WISHES_TAB } } });
  }
  if (!existingTabs.has(SETTINGS_TAB)) {
    requests.push({ addSheet: { properties: { title: SETTINGS_TAB } } });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    });
  }

  await Promise.all([
    ensureHeaderRow(GUESTS_TAB, GUESTS_HEADER),
    ensureHeaderRow(WISHES_TAB, WISHES_HEADER),
    ensureHeaderRow(SETTINGS_TAB, SETTINGS_HEADER),
  ]);
}

async function ensureHeaderRow(tab: string, header: string[]): Promise<void> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1:${String.fromCharCode(64 + header.length)}1`,
  });
  const firstRow = res.data.values?.[0];
  if (!firstRow || firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [header] },
    });
  }
}

async function readRows(tab: string): Promise<string[][]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A2:Z`,
  });
  return res.data.values || [];
}

async function appendRow(tab: string, row: string[]): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/** Finds a row by its id column (column A) and returns its 1-indexed sheet row number, or null. */
async function findRowIndexById(tab: string, id: string): Promise<number | null> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A2:A`,
  });
  const ids = res.data.values || [];
  const idx = ids.findIndex((r) => r[0] === id);
  return idx === -1 ? null : idx + 2;
}

// ---- Guests ----

export async function getGuests(): Promise<Guest[]> {
  const rows = await readRows(GUESTS_TAB);
  return rows
    .filter((r) => r[0])
    .map((r) => ({
      id: r[0],
      nama_tamu: r[1] || "",
      status_kirim: (r[2] as Guest["status_kirim"]) || "Belum",
      created_at: r[3] || "",
    }));
}

export async function addGuests(names: string[]): Promise<Guest[]> {
  const sheets = getClient();
  const now = new Date().toISOString();
  const created: Guest[] = names.map((name) => ({
    id: crypto.randomUUID(),
    nama_tamu: name,
    status_kirim: "Belum",
    created_at: now,
  }));
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${GUESTS_TAB}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: created.map((g) => [g.id, g.nama_tamu, g.status_kirim, g.created_at]),
    },
  });
  return created;
}

export async function updateGuestName(id: string, name: string): Promise<void> {
  const rowNum = await findRowIndexById(GUESTS_TAB, id);
  if (rowNum === null) throw new Error("Tamu tidak ditemukan");
  const sheets = getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${GUESTS_TAB}!B${rowNum}`,
    valueInputOption: "RAW",
    requestBody: { values: [[name]] },
  });
}

export async function setGuestSentStatus(id: string, status: Guest["status_kirim"]): Promise<void> {
  const rowNum = await findRowIndexById(GUESTS_TAB, id);
  if (rowNum === null) throw new Error("Tamu tidak ditemukan");
  const sheets = getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${GUESTS_TAB}!C${rowNum}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}

export async function deleteGuest(id: string): Promise<void> {
  await deleteRowById(GUESTS_TAB, id);
}

// ---- Wishes (read-only from the admin side; written by the public invite page) ----

export async function getWishes(): Promise<Wish[]> {
  const rows = await readRows(WISHES_TAB);
  return rows
    .filter((r) => r[0])
    .map((r) => ({
      id: r[0],
      nama_tamu: r[1] || "",
      kehadiran: (r[2] as Wish["kehadiran"]) || "hadir",
      pesan: r[3] || "",
      created_at: r[4] || "",
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function addWish(input: {
  nama_tamu: string;
  kehadiran: Wish["kehadiran"];
  pesan: string;
}): Promise<Wish> {
  const wish: Wish = {
    id: crypto.randomUUID(),
    nama_tamu: input.nama_tamu,
    kehadiran: input.kehadiran,
    pesan: input.pesan,
    created_at: new Date().toISOString(),
  };
  await appendRow(WISHES_TAB, [wish.id, wish.nama_tamu, wish.kehadiran, wish.pesan, wish.created_at]);
  return wish;
}

// ---- Settings (key/value pairs, single row per key) ----

const DEFAULT_SETTINGS: Settings = {
  nama_acara: "",
  base_link: "",
  template_pesan:
    "Halo {nama_tamu}, kami mengundang Anda untuk hadir di acara kami. Silakan buka undangan di: {link}",
};

export async function getSettings(): Promise<Settings> {
  const rows = await readRows(SETTINGS_TAB);
  const map = new Map(rows.map((r) => [r[0], r[1] || ""]));
  return {
    nama_acara: map.get("nama_acara") || DEFAULT_SETTINGS.nama_acara,
    base_link: map.get("base_link") || DEFAULT_SETTINGS.base_link,
    template_pesan: map.get("template_pesan") || DEFAULT_SETTINGS.template_pesan,
  };
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...partial };

  const sheets = getClient();
  const rows = await readRows(SETTINGS_TAB);
  const existingKeys = new Map(rows.map((r, i) => [r[0], i + 2]));

  for (const [key, value] of Object.entries(next)) {
    const rowNum = existingKeys.get(key);
    if (rowNum) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SETTINGS_TAB}!B${rowNum}`,
        valueInputOption: "RAW",
        requestBody: { values: [[value]] },
      });
    } else {
      await appendRow(SETTINGS_TAB, [key, value]);
    }
  }

  return next;
}

// ---- Shared delete helper ----

async function deleteRowById(tab: string, id: string): Promise<void> {
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = (meta.data.sheets || []).find((s) => s.properties?.title === tab);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) throw new Error(`Tab ${tab} tidak ditemukan`);

  const rowNum = await findRowIndexById(tab, id);
  if (rowNum === null) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowNum - 1,
              endIndex: rowNum,
            },
          },
        },
      ],
    },
  });
}
