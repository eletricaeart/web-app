const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const INPUT_DIR = "./input";
const OUTPUT_DIR = "./output";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

function migrateEntity(fileName) {
  const inputPath = path.join(INPUT_DIR, fileName);
  const outputPath = path.join(OUTPUT_DIR, fileName);

  const results = [];

  fs.createReadStream(inputPath)
    .pipe(csv())
    .on("data", (row) => {
      const id = row.id || cryptoRandomId();

      const created_at = row.created_at || row.data || new Date().toISOString();

      const data = { ...row };

      delete data.id;
      delete data.created_at;

      results.push({
        id,
        created_at,
        data: JSON.stringify(data),
      });
    })
    .on("end", () => {
      const header = "id,created_at,data\n";

      const lines = results
        .map((r) => {
          const safeData = r.data.replace(/"/g, '""');
          return `${r.id},${r.created_at},"${safeData}"`;
        })
        .join("\n");

      fs.writeFileSync(outputPath, header + lines);

      console.log(`✔ Migrado: ${fileName}`);
    });
}

function cryptoRandomId() {
  return Math.random().toString(36).substring(2, 10);
}

function runMigration() {
  const files = fs.readdirSync(INPUT_DIR);

  files.forEach((file) => {
    if (file.endsWith(".csv")) {
      migrateEntity(file);
    }
  });
}

runMigration();
