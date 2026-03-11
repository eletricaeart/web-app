import { getSheetsClient } from "./sheets";

export async function getAll(entity: string) {
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${entity}!A:C`,
  });

  const rows = res.data.values ?? [];

  return rows.slice(1).map((row) => ({
    id: row[0],
    created_at: row[1],
    ...JSON.parse(row[2] || "{}"),
  }));
}
