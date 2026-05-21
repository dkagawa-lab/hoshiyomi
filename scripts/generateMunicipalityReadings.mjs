import { writeFile } from "node:fs/promises";

const pages = 96;
const sourceBase = "https://www.e-stat.go.jp/municipalities/cities/areacode";

function decodeHtml(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, "\"")
    .trim();
}

function cell(row, className) {
  const match = row.match(new RegExp(`<td[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/td>`));
  return match ? decodeHtml(match[1]) : "";
}

function municipalityName(parentName, selfName) {
  if (!selfName) return parentName;
  if (parentName.endsWith("市") && selfName.endsWith("区")) return `${parentName}${selfName}`;
  return selfName;
}

function normalizeMunicipalityName(name) {
  return name.replace(/檮/g, "梼");
}

function municipalityReading(parentName, parentKana, selfName, selfKana) {
  if (!selfName) return parentKana;
  if (parentName.endsWith("市") && selfName.endsWith("区")) return `${parentKana}${selfKana}`;
  return selfKana;
}

const readings = {};

for (let page = 1; page <= pages; page += 1) {
  const url = `${sourceBase}?page=${page}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  const html = await response.text();
  const rows = html.match(/<tr>[\s\S]*?<\/tr>/g) ?? [];

  for (const row of rows) {
    if (!row.includes("todoNm")) continue;
    const prefecture = cell(row, "todoNm");
    const parentName = cell(row, "parentCityNm");
    const parentKana = cell(row, "parentCityKana");
    const selfName = cell(row, "selfCityNm");
    const selfKana = cell(row, "selfCityKana");
    if (!prefecture || (!parentName && !selfName)) continue;

    const name = normalizeMunicipalityName(municipalityName(parentName, selfName));
    const reading = municipalityReading(parentName, parentKana, selfName, selfKana);
    if (prefecture === "東京都" && name === "特別区部") continue;
    if (!name || !reading) continue;
    readings[`${prefecture}|${name}`] = reading;
  }
}

const file = `// Generated from e-Stat municipality city-code pages. Do not edit by hand.
export const municipalityReadings: Record<string, string> = ${JSON.stringify(readings, null, 2)};
`;

await writeFile("lib/municipalityReadings.generated.ts", file);
console.log(`Wrote ${Object.keys(readings).length} municipality readings`);
