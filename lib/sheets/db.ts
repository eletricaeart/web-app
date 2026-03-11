import { sheets } from "./client";

const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

export async function getAll(entity: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${entity}!A2:C`,
  });

  const rows = res.data.values || [];

  return rows.map((r) => ({
    id: r[0],
    created_at: r[1],
    ...JSON.parse(r[2]),
  }));
}

export async function create(entity: string, data: any) {
  const id = crypto.randomUUID();

  const row = [id, new Date().toISOString(), JSON.stringify(data)];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${entity}!A:C`,
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  });

  return { id, ...data };
}

export async function remove(entity: string, id: string) {
  const rows = await getAll(entity);

  const index = rows.findIndex((r) => r.id === id);

  if (index === -1) throw new Error("Not found");

  const rowNumber = index + 2;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    },
  });

  return { success: true };
}
