import fs from "node:fs/promises";

const sourcePath = "/tmp/pref_lce.json";
const cachePath = "/tmp/japan-municipality-coordinates.json";
const outputPath = new URL("../lib/japanLocations.ts", import.meta.url);

const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const cache = await readJson(cachePath, {});
const municipalities = source
  .filter((row) => row["都道府県名（漢字）"] && row["市区町村名（漢字）"])
  .map((row) => ({
    code: row["団体コード"],
    prefecture: row["都道府県名（漢字）"],
    name: row["市区町村名（漢字）"]
  }));

let cursor = 0;
const workers = Array.from({ length: 8 }, async () => {
  while (cursor < municipalities.length) {
    const item = municipalities[cursor++];
    const key = `${item.prefecture}${item.name}`;
    if (!cache[key]) {
      cache[key] = await geocode(key);
      await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
    }
  }
});

await Promise.all(workers);

const grouped = new Map();
for (const item of municipalities) {
  const key = `${item.prefecture}${item.name}`;
  const coordinates = cache[key] ?? { latitude: 35.6812, longitude: 139.7671 };
  if (!grouped.has(item.prefecture)) grouped.set(item.prefecture, []);
  grouped.get(item.prefecture).push({
    name: item.name,
    latitude: round(coordinates.latitude),
    longitude: round(coordinates.longitude)
  });
}

const file = `export type Municipality = {
  name: string;
  latitude: number;
  longitude: number;
};

export type PrefectureLocations = {
  prefecture: string;
  municipalities: Municipality[];
};

// Municipality names are generated from jmcjson pref_lce.json, which is based on MIC local government code data.
// Coordinates are representative points resolved through the Geospatial Information Authority of Japan address search.
export const japanLocations: PrefectureLocations[] = ${JSON.stringify(
  Array.from(grouped, ([prefecture, items]) => ({ prefecture, municipalities: items })),
  null,
  2
)};

export function findPrefecture(prefecture: string) {
  return japanLocations.find((location) => location.prefecture === prefecture) ?? japanLocations[0];
}
`;

await fs.writeFile(outputPath, file);
console.log(`Generated ${municipalities.length} municipalities in ${outputPath.pathname}`);

async function geocode(query) {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const coordinates = data?.[0]?.geometry?.coordinates;
      if (Array.isArray(coordinates) && coordinates.length >= 2) {
        return { longitude: Number(coordinates[0]), latitude: Number(coordinates[1]) };
      }
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  return null;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await fs.readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

function round(value) {
  return Math.round(Number(value) * 10000) / 10000;
}
