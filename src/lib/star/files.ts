import { uid } from "./store";
import type { Attachment } from "./types";

export const ACCEPTED =
  ".pdf,.txt,.md,.docx,.csv,.json,.png,.jpg,.jpeg,.webp,.gif,.svg";

const TEXT_EXT = /\.(txt|md|csv|json|log|tsv|xml|yaml|yml)$/i;
const MAX_BYTES = 12 * 1024 * 1024;

export class FileTooLargeError extends Error {}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read-failed"));
    r.readAsDataURL(file);
  });
}

/** Turn a browser File into an attachment the backend can pass to the AI provider. */
export async function toAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_BYTES) throw new FileTooLargeError(file.name);

  const base: Attachment = {
    id: uid(),
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  };

  if (file.type.startsWith("image/")) {
    return { ...base, dataUrl: await readAsDataUrl(file) };
  }
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
    return { ...base, mimeType: "application/pdf", dataUrl: await readAsDataUrl(file) };
  }
  if (file.type.startsWith("text/") || TEXT_EXT.test(file.name) || file.type === "application/json") {
    return { ...base, text: await file.text() };
  }
  if (/\.docx$/i.test(file.name)) {
    // DOCX is a zip container; the current provider cannot parse it directly.
    return { ...base, unsupported: true };
  }
  return { ...base, unsupported: true };
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
