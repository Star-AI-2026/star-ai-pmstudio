import type { GeneratedFileKind } from "@/lib/ai/versions";

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export type GeneratedFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  kind: GeneratedFileKind;
};

type ZipEntry = { name: string; data: Uint8Array };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function xmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return map[char] ?? char;
  });
}

function slug(value: string): string {
  const clean = value
    .replace(/[#*_`~]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return clean || "star-ai-document";
}

function filenameFromTitle(title: string, kind: GeneratedFileKind): string {
  return `${slug(title)}.${kind}`;
}

function markdownLines(content: string): string[] {
  return content
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Minimal ZIP writer using the ZIP "stored" method (no compression). */
function createZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, localOffset, true);
    central.set(name, 46);
    centralParts.push(central);

    localOffset += local.length + data.length;
  }

  const centralDirectory = concatBytes(centralParts);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralDirectory.length, true);
  ev.setUint32(16, localOffset, true);
  ev.setUint16(20, 0, true);
  return concatBytes([...localParts, centralDirectory, end]);
}

function zipEntry(name: string, value: string): ZipEntry {
  return { name, data: encoder.encode(value) };
}

function createDocx(title: string, content: string): Uint8Array {
  const lines = markdownLines(content);
  const body = lines
    .map((line) => {
      const paragraph = line.trim();
      const isHeading = /^#{1,6}\s/.test(line);
      const text = xmlEscape(paragraph.replace(/^#{1,6}\s*/, ""));
      return isHeading
        ? `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`
        : `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
    })
    .join("");
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>${xmlEscape(title)}</w:t></w:r></w:p>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style></w:styles>`;
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${xmlEscape(title)}</dc:title><dc:creator>Star-AI</dc:creator></cp:coreProperties>`;
  return createZip([
    zipEntry("[Content_Types].xml", contentTypes),
    zipEntry("_rels/.rels", rels),
    zipEntry("word/document.xml", documentXml),
    zipEntry("word/styles.xml", styles),
    zipEntry("docProps/core.xml", core),
  ]);
}

function slideChunks(title: string, content: string): { title: string; body: string[] }[] {
  const rawLines = markdownLines(content);
  const chunks: { title: string; body: string[] }[] = [
    { title, body: ["Created with Star-AI"] },
  ];
  let currentTitle = "Overview";
  let body: string[] = [];
  const flush = () => {
    if (!body.length) return;
    chunks.push({ title: currentTitle, body: body.slice(0, 7) });
    body = [];
  };

  for (const line of rawLines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentTitle = headingMatch[1] ?? "Overview";
      continue;
    }

    if (!currentTitle) currentTitle = "Overview";
    body.push(line.replace(/^[-*+]\s*/, "• "));
    if (body.length >= 7) {
      flush();
      currentTitle = `${title} · Continued`;
    }
  }
  flush();
  return chunks.slice(0, 30);
}

function pptxSlideXml(title: string, body: string[]): string {
  const textShape = (id: number, name: string, x: number, y: number, cx: number, cy: number, lines: string[], titleShape = false) => {
    const paras = lines.map((line) => {
      const rtl = /[\u0600-\u06ff]/.test(line) ? ' rtl="1"' : "";
      const textColor = titleShape ? "58BDEB" : "FFFFFF";
      return `<a:p><a:pPr${rtl}/><a:r><a:rPr lang="en-US" sz="${titleShape ? 3000 : 1900}" b="${titleShape ? 1 : 0}"><a:solidFill><a:srgbClr val="${textColor}"/></a:solidFill></a:rPr><a:t>${xmlEscape(line)}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p>`;
    }).join("");
    return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="t" lIns="100000" rIns="100000" tIns="80000" bIns="80000"/><a:lstStyle/>${paras}</p:txBody></p:sp>`;
  };
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="10182A"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${textShape(2, "Title", 650000, 450000, 7800000, 1250000, [title], true)}${textShape(3, "Content", 750000, 1850000, 7700000, 3450000, body.length ? body : [" "])}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

function createPptx(title: string, content: string): Uint8Array {
  const slides = slideChunks(title, content).slice(0, 30);
  const overrides = slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("");
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${overrides}</Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
  const slideIds = slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("");
  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideIds}</p:sldIdLst><p:sldSz cx="9144000" cy="5143500" type="wide"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`;
  const presentationRels = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${slides.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("")}</Relationships>`;
  const master = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`;
  const masterRels = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
  const layout = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
  const layoutRels = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;
  const theme = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Star-AI"><a:themeElements><a:clrScheme name="Star-AI"><a:dk1><a:srgbClr val="10182A"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="202A40"/></a:dk2><a:lt2><a:srgbClr val="F4F6FA"/></a:lt2><a:accent1><a:srgbClr val="58BDEB"/></a:accent1><a:accent2><a:srgbClr val="9C79EB"/></a:accent2><a:accent3><a:srgbClr val="F28A43"/></a:accent3><a:accent4><a:srgbClr val="4ABF9B"/></a:accent4><a:accent5><a:srgbClr val="E4C45E"/></a:accent5><a:accent6><a:srgbClr val="D66EA6"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Star-AI"><a:majorFont><a:latin typeface="Aptos Display"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Aptos"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Star-AI"><a:fillStyleLst><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="lt1"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;

  const entries: ZipEntry[] = [
    zipEntry("[Content_Types].xml", contentTypes),
    zipEntry("_rels/.rels", rootRels),
    zipEntry("ppt/presentation.xml", presentation),
    zipEntry("ppt/_rels/presentation.xml.rels", presentationRels),
    zipEntry("ppt/slideMasters/slideMaster1.xml", master),
    zipEntry("ppt/slideMasters/_rels/slideMaster1.xml.rels", masterRels),
    zipEntry("ppt/slideLayouts/slideLayout1.xml", layout),
    zipEntry("ppt/slideLayouts/_rels/slideLayout1.xml.rels", layoutRels),
    zipEntry("ppt/theme/theme1.xml", theme),
  ];
  slides.forEach((slide, index) => {
    const number = index + 1;
    entries.push(zipEntry(`ppt/slides/slide${number}.xml`, pptxSlideXml(slide.title, slide.body)));
    entries.push(zipEntry(`ppt/slides/_rels/slide${number}.xml.rels`, `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`));
  });
  return createZip(entries);
}

function csvRows(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const tableLines = lines.filter((line) => line.trim().startsWith("|"));
  if (tableLines.length >= 2) {
    return tableLines
      .filter((line) => !/^\s*\|?\s*:?-{3,}/.test(line))
      .map((line) => line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim().replace(/\*\*/g, "")));
  }
  return lines.map((line, index) => [String(index + 1), line.replace(/^#{1,6}\s*/, "").replace(/^[-*+]\s*/, "")]);
}

function encodeDataUrl(data: Uint8Array, mimeType: string): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < data.length; i += chunk) {
    binary += String.fromCharCode(...data.subarray(i, i + chunk));
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

function decodeDataUrl(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function splitCanvasLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const result: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      result.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) result.push(current);
  return result;
}

async function createPdf(title: string, content: string): Promise<Uint8Array> {
  const pageWidth = 1200;
  const pageHeight = 1697;
  const margin = 92;
  const canvas = document.createElement("canvas");
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PDF canvas is unavailable in this browser.");

  const inputLines = markdownLines(content);
  const pages: Uint8Array[] = [];
  let y = 0;
  const startPage = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageWidth, pageHeight);
    ctx.fillStyle = "#162033";
    ctx.direction = /[\u0600-\u06ff]/.test(title) ? "rtl" : "ltr";
    ctx.textAlign = ctx.direction === "rtl" ? "right" : "left";
    ctx.font = "bold 42px Arial, sans-serif";
    ctx.fillText(title, ctx.direction === "rtl" ? pageWidth - margin : margin, margin + 45, pageWidth - margin * 2);
    ctx.strokeStyle = "#dbe2ee";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, margin + 80);
    ctx.lineTo(pageWidth - margin, margin + 80);
    ctx.stroke();
    y = margin + 140;
  };
  const savePage = () => {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    pages.push(decodeDataUrl(dataUrl));
  };
  startPage();
  for (const rawLine of inputLines) {
    const line = rawLine.trim();
    const rtl = /[\u0600-\u06ff]/.test(line);
    ctx.direction = rtl ? "rtl" : "ltr";
    ctx.textAlign = rtl ? "right" : "left";
    ctx.font = "26px Arial, sans-serif";
    const wrapped = splitCanvasLines(ctx, line, pageWidth - margin * 2);
    for (const wrappedLine of wrapped) {
      if (y > pageHeight - margin - 40) {
        savePage();
        startPage();
      }
      ctx.fillStyle = "#1f2937";
      ctx.fillText(wrappedLine, rtl ? pageWidth - margin : margin, y, pageWidth - margin * 2);
      y += 39;
    }
    y += 13;
  }
  savePage();

  const objects: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const append = (part: Uint8Array) => {
    objects.push(part);
    length += part.length;
  };
  append(encoder.encode("%PDF-1.4\n%âãÏÓ\n"));
  const pushObject = (id: number, bytes: Uint8Array) => {
    offsets[id] = length;
    append(encoder.encode(`${id} 0 obj\n`));
    append(bytes);
    append(encoder.encode("\nendobj\n"));
  };

  const pageObjectIds = pages.map((_, i) => 3 + i * 3);
  pushObject(1, encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
  pushObject(2, encoder.encode(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`));
  pages.forEach((jpeg, index) => {
    const pageId = 3 + index * 3;
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    pushObject(pageId, encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`));
    const imageHeader = encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${pageWidth} /Height ${pageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    pushObject(imageId, concatBytes([imageHeader, jpeg, encoder.encode("\nendstream")]));
    const stream = encoder.encode("q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n");
    pushObject(contentId, encoder.encode(`<< /Length ${stream.length} >>\nstream\n${decoder.decode(stream)}endstream`));
  });
  const xrefOffset = length;
  const xrefLines = ["xref", `0 ${offsets.length}`, "0000000000 65535 f "];
  for (let i = 1; i < offsets.length; i++) xrefLines.push(`${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n `);
  const trailer = `${xrefLines.join("\n")}\ntrailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  append(encoder.encode(trailer));
  return concatBytes(objects);
}

export async function createGeneratedFile(
  title: string,
  content: string,
  kind: GeneratedFileKind,
): Promise<GeneratedFile> {
  const safeTitle = title.trim() || "Star-AI document";
  let bytes: Uint8Array;
  let mimeType: string;

  switch (kind) {
    case "docx":
      bytes = createDocx(safeTitle, content);
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      break;
    case "pptx":
      bytes = createPptx(safeTitle, content);
      mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      break;
    case "pdf":
      bytes = await createPdf(safeTitle, content);
      mimeType = "application/pdf";
      break;
    case "xlsx": {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet(csvRows(content));
      XLSX.utils.book_append_sheet(workbook, sheet, "Star-AI Output");
      bytes = new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      break;
    }
    case "csv": {
      const rows = csvRows(content);
      const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
      bytes = encoder.encode(`\uFEFF${csv}`);
      mimeType = "text/csv;charset=utf-8";
      break;
    }
    case "txt":
      bytes = encoder.encode(content);
      mimeType = "text/plain;charset=utf-8";
      break;
    default: {
      const neverKind: never = kind;
      throw new Error(`Unsupported file format: ${neverKind}`);
    }
  }

  return {
    id: uid(),
    name: filenameFromTitle(safeTitle, kind),
    mimeType,
    size: bytes.length,
    dataUrl: encodeDataUrl(bytes, mimeType),
    kind,
  };
}
