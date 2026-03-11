/** lib/sheets/db.ts */
import { google } from "googleapis";

// Configuração de Autenticação
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"],
);

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

// Função auxiliar para pegar o ID numérico da aba (necessário para DELETE)
async function getSheetIdByName(entity: string) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === entity,
  );
  return sheet?.properties?.sheetId;
}

// LER TODOS
export async function getAll(entity: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${entity}!A2:C`, // Coluna A: ID, B: Data, C: JSON
  });

  const rows = res.data.values || [];
  return rows.map((r) => ({
    id: r[0],
    created_at: r[1],
    ...(r[2] ? JSON.parse(r[2]) : {}),
  }));
}

// CRIAR
export async function create(entity: string, data: any) {
  const id = data.id || crypto.randomUUID();
  const row = [id, new Date().toISOString(), JSON.stringify(data)];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${entity}!A:C`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return { id, ...data };
}

// REMOVER
export async function remove(entity: string, id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${entity}!A:A`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);

  if (rowIndex === -1) throw new Error("Registo não encontrado");

  const sheetId = await getSheetIdByName(entity);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return { success: true };
}
