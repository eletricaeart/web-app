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

export async function getAll(entity: string) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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

// Faz o mesmo para as funções create e remove...
export async function create(entity: string, data: any) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

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
