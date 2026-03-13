/** lib/sheets/db.ts */
import { google } from "googleapis";

// Função para limpar a chave
const getCleanKey = (key: string | undefined) => {
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n").replace(/^"(.*)"$/, "$1");
};

async function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = getCleanKey(process.env.GOOGLE_PRIVATE_KEY);

  // Usando GoogleAuth em vez de JWT diretamente para maior compatibilidade
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  // @ts-ignore
  return google.sheets({ version: "v4", auth: authClient });
}

// this
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

/**
 * read all
 * */
export async function getAll(entity: string) {
  try {
    // const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("GOOGLE_SHEET_ID ausente.");

    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${entity}!A2:C`,
    });

    const rows = res.data.values || [];
    return rows.map((r) => ({
      id: r[0],
      created_at: r[1],
      ...(r[2] ? JSON.parse(r[2]) : {}),
    }));
  } catch (error: any) {
    console.error(`[SHEETS ERROR] Erro em ${entity}:`, error.message);
    throw error;
  }
}

/**
 * create
 * */
export async function create(entity: string, data: any) {
  const sheets = await getSheetsClient();
  // const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const id = data.id || crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // Limpamos o payload para não duplicar ID e Data dentro do JSON na coluna C
  const { id: _, created_at: __, ...jsonPayload } = data;
  const row = [id, createdAt, JSON.stringify(jsonPayload)];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${entity}!A:C`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return { id, created_at: createdAt, ...jsonPayload };
}

/** --- UPDATE (O segredo é localizar a linha pelo ID) ---
 * */
export async function update(entity: string, id: string, data: any) {
  const sheets = await getSheetsClient();

  // Procurar em qual linha o ID está
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${entity}!A:A`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === id);

  if (rowIndex === -1)
    throw new Error("Registo não encontrado para atualização.");

  const rowNumber = rowIndex + 1; // Google Sheets começa em 1
  const { id: _, created_at, ...jsonPayload } = data;

  // Manter a data de criação original se ela existir
  const row = [
    id,
    created_at || new Date().toISOString(),
    JSON.stringify(jsonPayload),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${entity}!A${rowNumber}:C${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
  return { id, ...data };
}

/** --- DELETE ---
 * */
export async function remove(entity: string, id: string) {
  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${entity}!A:A`,
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === id);

  if (rowIndex === -1) throw new Error("ID não encontrado.");

  // Precisamos do ID numérico da aba
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === entity,
  )?.properties?.sheetId;

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
