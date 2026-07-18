import fs from "fs";
import csv from "csv-parser";

const INPUT_FILE = "./data/Eletrica_&_Art_DB - orcamentos.csv";
const OUTPUT_FILE = "./data/orcamentos_migrado.csv";

const rows = [];

fs.createReadStream(INPUT_FILE)
  .pipe(csv())
  .on("data", (row) => {
    rows.push(row);
  })
  .on("end", () => {
    const output = [];

    output.push(["id", "created_at", "data"]);

    for (const row of rows) {
      const id = row.id || `EA-${Date.now()}-${Math.random()}`;

      const createdAt =
        row.createdAt ||
        row.created_at ||
        row.emissao ||
        new Date().toISOString();

      const data = { ...row };

      delete data.id;
      delete data.createdAt;
      delete data.created_at;

      const json = JSON.stringify(data).replace(/"/g, '""');

      output.push([id, createdAt, `"${json}"`]);
    }

    const csvContent = output.map((r) => r.join(",")).join("\n");

    fs.writeFileSync(OUTPUT_FILE, csvContent);

    console.log("✅ Migração concluída!");
    console.log("Arquivo gerado:", OUTPUT_FILE);
  });
