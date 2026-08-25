import { uid } from "./store";
import type { Attachment } from "./types";

export const ACCEPTED =
  ".pdf,.txt,.md,.docx,.doc,.csv,.tsv,.json,.xlsx,.xls,.log,.xml,.yaml,.yml,.png,.jpg,.jpeg,.webp,.gif,.svg";

const TEXT_EXT = /\.(txt|md|csv|tsv|json|log|xml|yaml|yml|ya?ml)$/i;
const SHEET_EXT = /\.(xlsx|xls)$/i;
const CSV_EXT = /\.(csv|tsv)$/i;

export const MAX_BYTES = 12 * 1024 * 1024;
const MAX_TEXT_CHARS = 200_000;

export class FileTooLargeError extends Error {}
export class UnreadableFileError extends Error {}

export type UploadProgress = { id: string; name: string; size: number; progress: number };

function readAsDataUrl(file: File, onProgress?: (pct: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 90));
    };
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new UnreadableFileError(file.name));
    r.readAsDataURL(file);
  });
}

function clampText(text: string) {
  return text.length > MAX_TEXT_CHARS
    ? `${text.slice(0, MAX_TEXT_CHARS)}\n\n[Content truncated — file is larger than the analysis window.]`
    : text;
}

/* ---------------------------------- data ---------------------------------- */

type Column = { name: string; type: string; missing: number; sample: string[]; stats?: string };

function profileRows(rows: Record<string, unknown>[]): { summary: string; text: string } {
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const columns: Column[] = headers.map((name) => {
    const values = rows.map((r) => r[name]);
    const present = values.filter((v) => v !== undefined && v !== null && v !== "");
    const numbers = present.map((v) => Number(v)).filter((n) => Number.isFinite(n));
    const isNumeric = present.length > 0 && numbers.length / present.length > 0.8;
    const col: Column = {
      name,
      type: isNumeric ? "number" : "text",
      missing: values.length - present.length,
      sample: present.slice(0, 3).map((v) => String(v).slice(0, 40)),
    };
    if (isNumeric && numbers.length) {
      const sum = numbers.reduce((a, b) => a + b, 0);
      const sorted = [...numbers].sort((a, b) => a - b);
      col.stats = `min ${sorted[0]}, max ${sorted[sorted.length - 1]}, mean ${(sum / numbers.length).toFixed(2)}, median ${sorted[Math.floor(sorted.length / 2)]}`;
    }
    return col;
  });

  const preview = rows.slice(0, 40);
  const text = [
    `Dataset profile — ${rows.length} rows × ${headers.length} columns.`,
    "",
    "Columns:",
    ...columns.map(
      (c) =>
        `- ${c.name} (${c.type}${c.missing ? `, ${c.missing} missing` : ""})${c.stats ? ` — ${c.stats}` : ""}; e.g. ${c.sample.join(" | ") || "—"}`,
    ),
    "",
    `First ${preview.length} rows as JSON:`,
    JSON.stringify(preview),
  ].join("\n");

  return { summary: `${rows.length} rows · ${headers.length} columns`, text: clampText(text) };
}

function parseDelimited(raw: string, delimiter: string): Record<string, unknown>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    if (quoted) {
      if (ch === '"' && raw[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!header) return [];
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h || `col_${i + 1}`, r[i] ?? ""])));
}

/* -------------------------------- pipeline -------------------------------- */

export async function toAttachment(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<Attachment> {
  if (file.size > MAX_BYTES) throw new FileTooLargeError(file.name);
  const tick = (n: number) => onProgress?.(n);
  tick(5);

  const base: Attachment = {
    id: uid(),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };

  try {
    // Images -> vision analysis
    if (file.type.startsWith("image/")) {
      const dataUrl = await readAsDataUrl(file, tick);
      tick(100);
      return { ...base, kind: "image", dataUrl, summary: "Image · vision analysis" };
    }

    // PDF -> native document understanding
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
      const dataUrl = await readAsDataUrl(file, tick);
      tick(100);
      return {
        ...base,
        kind: "pdf",
        mimeType: "application/pdf",
        dataUrl,
        summary: "PDF · document analysis",
      };
    }

    // Spreadsheets -> profiled dataset
    if (SHEET_EXT.test(file.name) || file.type.includes("spreadsheet") || file.type.includes("ms-excel")) {
      const XLSX = await import("xlsx");
      tick(35);
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheetName = wb.SheetNames[0]!;
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName]!, {
        defval: "",
      });
      tick(85);
      const { summary, text } = profileRows(rows);
      tick(100);
      return {
        ...base,
        kind: "data",
        summary: `${sheetName} · ${summary}`,
        text: `Spreadsheet "${file.name}" (sheet: ${sheetName}, sheets available: ${wb.SheetNames.join(", ")})\n\n${text}`,
      };
    }

    // CSV / TSV -> profiled dataset
    if (CSV_EXT.test(file.name) || file.type === "text/csv") {
      const raw = await file.text();
      tick(60);
      const rows = parseDelimited(raw, /\.tsv$/i.test(file.name) ? "\t" : ",");
      const { summary, text } = profileRows(rows);
      tick(100);
      return { ...base, kind: "data", summary, text: `CSV file "${file.name}"\n\n${text}` };
    }

    // DOCX -> extracted text
    if (/\.docx$/i.test(file.name) || file.type.includes("wordprocessingml")) {
      const mammoth = await import("mammoth");
      tick(35);
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      tick(90);
      const text = result.value.trim();
      if (!text) throw new UnreadableFileError(file.name);
      tick(100);
      return {
        ...base,
        kind: "document",
        summary: `Word document · ${text.split(/\s+/).length} words`,
        text: clampText(`Word document "${file.name}"\n\n${text}`),
      };
    }

    // Plain text formats
    if (file.type.startsWith("text/") || TEXT_EXT.test(file.name) || file.type === "application/json") {
      const text = await file.text();
      tick(100);
      return {
        ...base,
        kind: "text",
        summary: `${text.split(/\r?\n/).length} lines`,
        text: clampText(text),
      };
    }
  } catch (err) {
    if (err instanceof FileTooLargeError) throw err;
    throw new UnreadableFileError(file.name);
  }

  // Legacy .doc and anything else we cannot read in the browser
  return {
    ...base,
    kind: "other",
    unsupported: true,
    summary: "Unsupported format — paste the content instead",
  };
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
