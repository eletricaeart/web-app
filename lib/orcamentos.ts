import { getSheetsClient } from "./sheets";

export async function getOrcamentos() {
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "orcamentos!A:C",
  });

  const rows = res.data.values ?? [];

  const data = rows.slice(1).map((row) => {
    const json = JSON.parse(row[2] || "{}");
    return {
      id: row[0],
      created_at: row[1],
      ...json,
    };
  });

  return data;
}

export async function createOrcamento(payload: any) {
  const sheets = await getSheetsClient();

  const row = [payload.id, new Date().toISOString(), JSON.stringify(payload)];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "orcamentos!A:C",
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  });

  return payload;
}

export async function deleteOrcamento(id: string) {
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "orcamentos!A:A",
  });

  const rows = res.data.values ?? [];

  const rowIndex = rows.findIndex((row) => row[0] === id);

  if (rowIndex === -1) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}
