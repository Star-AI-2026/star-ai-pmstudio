import type { GeneratedFileKind } from "@/lib/ai/versions";

/** Detect explicit image-generation requests without treating ordinary image questions as generation. */
export function detectImageGenerationPrompt(text: string): string | null {
  const value = text.trim();
  if (!value) return null;

  const persianAction = /(?:بساز|درست\s*کن|تولید\s*کن|ایجاد\s*کن|طراحی\s*کن|بکش)/i;
  const persianImage = /(?:عکس|تصویر|پوستر|لوگو|نقاشی|illustration)/i;
  const englishAction = /\b(?:generate|create|make|draw|render|design)\b/i;
  const englishImage = /\b(?:image|picture|photo|poster|logo|illustration|artwork)\b/i;

  if (
    (persianAction.test(value) && persianImage.test(value)) ||
    (englishAction.test(value) && englishImage.test(value))
  ) {
    return value;
  }
  return null;
}

/** Detect an explicitly requested downloadable file format. */
export function detectFileGenerationRequest(text: string): GeneratedFileKind | null {
  const value = text.trim().toLowerCase();
  if (!value) return null;

  const intent = /(?:بساز|درست\s*کن|تهیه\s*کن|ایجاد\s*کن|تبدیل\s*کن|خروجی\s*بگیر|آماده\s*کن|generate|create|make|prepare|export|convert|build)/i;
  const hasFileLanguage = /(?:فایل|document|file|گزارش|ارائه|اسلاید|جدول)/i.test(value);
  if (!intent.test(value) && !hasFileLanguage) return null;

  if (/\b(?:pptx|powerpoint|presentation|slides?)\b|پاور\s*پوینت|پاورپوینت|اسلاید/i.test(value)) return "pptx";
  if (/\b(?:docx|word)\b|ورد/i.test(value)) return "docx";
  if (/\bpdf\b|پی\s*دی\s*اف/i.test(value)) return "pdf";
  if (/\b(?:xlsx|excel|spreadsheet)\b|اکسل/i.test(value)) return "xlsx";
  if (/\bcsv\b/i.test(value)) return "csv";
  if (/\btxt\b|متن\s*ساده/i.test(value)) return "txt";
  return null;
}
