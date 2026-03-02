/**
 * --- [ return clen date only ]
 *  */
export function getCleanDate(date: string | null | undefined): string {
  if (!date) return "";

  return date.includes("T")
    ? date.split("T")[0].split("-").reverse().join("/")
    : date;
}

/**
 * --- [ gerador de UUIDs ]
 *  */
export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antigos
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * --- [ CID ]
 *  */
export function CID(): string {
  return Math.floor(100000000000 + Math.random() * 900000000000)
    .toString()
    .replace(/(\d{4})(?=\d)/g, "$1+");
}
