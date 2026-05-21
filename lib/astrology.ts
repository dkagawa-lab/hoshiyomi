import type { GenderKey, RomanticInterestKey } from "@/lib/profileOptions";

export type BirthInput = {
  name: string;
  date: string;
  time?: string;
  latitude: number;
  longitude: number;
  city: string;
  gender?: GenderKey;
  romanticInterest?: RomanticInterestKey;
};

export type BodyPosition = {
  key: string;
  name: string;
  longitude: number;
  sign: ZodiacSign;
  degree: number;
  house?: number;
};

export type ZodiacSign = {
  key: string;
  name: string;
  element: "火" | "地" | "風" | "水";
};

export type Aspect = {
  from: string;
  to: string;
  type: string;
  angle: number;
  orb: number;
};

export type TransitAspect = {
  transit: BodyPosition;
  natal: BodyPosition;
  type: string;
  angle: number;
  orb: number;
};

export type TransitSnapshot = {
  dateLabel: string;
  chart: Chart;
  aspects: TransitAspect[];
};

export type Chart = {
  input: BirthInput;
  julianDay: number;
  ascendant?: BodyPosition;
  midheaven?: BodyPosition;
  planets: BodyPosition[];
  aspects: Aspect[];
  houses: number[];
};

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const EPS = 23.4393 * RAD;

export const zodiac: ZodiacSign[] = [
  { key: "aries", name: "牡羊座", element: "火" },
  { key: "taurus", name: "牡牛座", element: "地" },
  { key: "gemini", name: "双子座", element: "風" },
  { key: "cancer", name: "蟹座", element: "水" },
  { key: "leo", name: "獅子座", element: "火" },
  { key: "virgo", name: "乙女座", element: "地" },
  { key: "libra", name: "天秤座", element: "風" },
  { key: "scorpio", name: "蠍座", element: "水" },
  { key: "sagittarius", name: "射手座", element: "火" },
  { key: "capricorn", name: "山羊座", element: "地" },
  { key: "aquarius", name: "水瓶座", element: "風" },
  { key: "pisces", name: "魚座", element: "水" }
];

const planetNames: Record<string, string> = {
  sun: "太陽",
  moon: "月",
  mercury: "水星",
  venus: "金星",
  mars: "火星",
  jupiter: "木星",
  saturn: "土星",
  uranus: "天王星",
  neptune: "海王星",
  pluto: "冥王星"
};

type Elements = {
  N: number;
  i: number;
  w: number;
  a: number;
  e: number;
  M: number;
};

const norm = (degrees: number) => ((degrees % 360) + 360) % 360;
const angularDistance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

function jdFromInput(input: BirthInput) {
  const time = input.time || "12:00";
  const date = new Date(`${input.date}T${time}:00+09:00`);
  return date.getTime() / 86400000 + 2440587.5;
}

function signFor(longitude: number) {
  const fixed = norm(longitude);
  const sign = zodiac[Math.floor(fixed / 30)];
  return { sign, degree: fixed % 30 };
}

function body(key: string, longitude: number, house?: number): BodyPosition {
  const { sign, degree } = signFor(longitude);
  return { key, name: planetNames[key] || key, longitude: norm(longitude), sign, degree, house };
}

function elements(key: string, d: number): Elements {
  switch (key) {
    case "mercury":
      return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d };
    case "venus":
      return { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d };
    case "mars":
      return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d };
    case "jupiter":
      return { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d };
    case "saturn":
      return { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d };
    case "uranus":
      return { N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d };
    case "neptune":
      return { N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d };
    default:
      throw new Error(`Unknown body: ${key}`);
  }
}

function heliocentric(key: string, d: number) {
  const el = elements(key, d);
  const M = norm(el.M) * RAD;
  const E = M + el.e * Math.sin(M) * (1 + el.e * Math.cos(M));
  const xv = el.a * (Math.cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const N = el.N * RAD;
  const i = el.i * RAD;
  const w = el.w * RAD;
  return {
    x: r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i)),
    y: r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i)),
    z: r * Math.sin(v + w) * Math.sin(i)
  };
}

function sunLongitude(d: number) {
  const w = 282.9404 + 4.70935e-5 * d;
  const e = 0.016709 - 1.151e-9 * d;
  const M = norm(356.047 + 0.9856002585 * d) * RAD;
  const E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  const xv = Math.cos(E) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv) * DEG;
  return norm(v + w);
}

function moonLongitude(d: number) {
  const N = (125.1228 - 0.0529538083 * d) * RAD;
  const i = 5.1454 * RAD;
  const w = (318.0634 + 0.1643573223 * d) * RAD;
  const a = 60.2666;
  const e = 0.0549;
  const M = norm(115.3654 + 13.0649929509 * d) * RAD;
  const E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);
  const x = r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i));
  const y = r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i));
  return norm(Math.atan2(y, x) * DEG);
}

function geocentricPlanet(key: string, d: number) {
  const p = heliocentric(key, d);
  const sun = sunLongitude(d) * RAD;
  const earth = { x: -Math.cos(sun), y: -Math.sin(sun), z: 0 };
  const x = p.x + earth.x;
  const y = p.y + earth.y;
  const z = p.z + earth.z;
  const lon = Math.atan2(y * Math.cos(EPS) - z * Math.sin(EPS), x) * DEG;
  return norm(lon);
}

function plutoLongitude(d: number) {
  const P = (238.95 + 0.003968789 * d) * RAD;
  const lon =
    238.9508 +
    0.00400703 * d -
    19.799 * Math.sin(P) +
    19.848 * Math.cos(P) +
    0.897 * Math.sin(2 * P) -
    4.956 * Math.cos(2 * P) +
    0.61 * Math.sin(3 * P) +
    1.211 * Math.cos(3 * P) -
    0.341 * Math.sin(4 * P) -
    0.19 * Math.cos(4 * P) +
    0.128 * Math.sin(5 * P) -
    0.034 * Math.cos(5 * P) -
    0.038 * Math.sin(6 * P) +
    0.031 * Math.cos(6 * P);
  const lat =
    -3.9082 -
    5.453 * Math.sin(P) -
    14.975 * Math.cos(P) +
    3.527 * Math.sin(2 * P) +
    1.673 * Math.cos(2 * P) -
    1.051 * Math.sin(3 * P) +
    0.328 * Math.cos(3 * P) +
    0.179 * Math.sin(4 * P) -
    0.292 * Math.cos(4 * P) +
    0.019 * Math.sin(5 * P) +
    0.1 * Math.cos(5 * P) -
    0.031 * Math.sin(6 * P) -
    0.026 * Math.cos(6 * P);
  const r =
    40.72 +
    6.68 * Math.sin(P) +
    6.9 * Math.cos(P) -
    1.18 * Math.sin(2 * P) -
    0.03 * Math.cos(2 * P) +
    0.15 * Math.sin(3 * P) -
    0.14 * Math.cos(3 * P);
  const lonRad = lon * RAD;
  const latRad = lat * RAD;
  const xh = r * Math.cos(lonRad) * Math.cos(latRad);
  const yh = r * Math.sin(lonRad) * Math.cos(latRad);
  const zh = r * Math.sin(latRad);
  const sun = sunLongitude(d) * RAD;
  const earth = { x: -Math.cos(sun), y: -Math.sin(sun), z: 0 };
  const x = xh + earth.x;
  const y = yh + earth.y;
  const z = zh + earth.z;
  return norm(Math.atan2(y * Math.cos(EPS) - z * Math.sin(EPS), x) * DEG);
}

function siderealTime(jd: number, longitude: number) {
  const d = jd - 2451545.0;
  return norm(280.46061837 + 360.98564736629 * d + longitude) * RAD;
}

function ascMc(input: BirthInput, jd: number) {
  if (!input.time) return {};
  const lat = input.latitude * RAD;
  const lst = siderealTime(jd, input.longitude);
  const mc = norm(Math.atan2(Math.sin(lst), Math.cos(lst) * Math.cos(EPS)) * DEG);
  const asc = norm(Math.atan2(-Math.cos(lst), Math.sin(lst) * Math.cos(EPS) + Math.tan(lat) * Math.sin(EPS)) * DEG);
  return { asc, mc };
}

function houseFor(longitude: number, asc?: number) {
  if (asc === undefined) return undefined;
  return Math.floor(norm(longitude - asc) / 30) + 1;
}

function findAspects(planets: BodyPosition[]) {
  const defs = [
    { type: "コンジャンクション", angle: 0, orb: 8 },
    { type: "セクスタイル", angle: 60, orb: 5 },
    { type: "スクエア", angle: 90, orb: 6 },
    { type: "トライン", angle: 120, orb: 6 },
    { type: "オポジション", angle: 180, orb: 8 }
  ];
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const distance = angularDistance(planets[i].longitude, planets[j].longitude);
      const match = defs.find((d) => Math.abs(distance - d.angle) <= d.orb);
      if (match) {
        aspects.push({ from: planets[i].name, to: planets[j].name, type: match.type, angle: match.angle, orb: Math.abs(distance - match.angle) });
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb).slice(0, 12);
}

function findTransitAspects(transitPlanets: BodyPosition[], natalPlanets: BodyPosition[]) {
  const defs = [
    { type: "コンジャンクション", angle: 0, orb: 3 },
    { type: "セクスタイル", angle: 60, orb: 2.5 },
    { type: "スクエア", angle: 90, orb: 3 },
    { type: "トライン", angle: 120, orb: 3 },
    { type: "オポジション", angle: 180, orb: 3 }
  ];
  const aspects: TransitAspect[] = [];
  for (const transit of transitPlanets) {
    for (const natal of natalPlanets) {
      const distance = angularDistance(transit.longitude, natal.longitude);
      const match = defs.find((d) => Math.abs(distance - d.angle) <= d.orb);
      if (match) {
        aspects.push({ transit, natal, type: match.type, angle: match.angle, orb: Math.abs(distance - match.angle) });
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb).slice(0, 16);
}

function chartInputFromDate(base: BirthInput, date: Date): BirthInput {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    ...base,
    name: "現在の星",
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`
  };
}

export function calculateChart(input: BirthInput): Chart {
  const julianDay = jdFromInput(input);
  const d = julianDay - 2451543.5;
  const points = ascMc(input, julianDay);
  const keys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  const longitudes: Record<string, number> = {
    sun: sunLongitude(d),
    moon: moonLongitude(d)
  };
  for (const key of keys.slice(2)) longitudes[key] = key === "pluto" ? plutoLongitude(d) : geocentricPlanet(key, d);
  const planets = keys.map((key) => body(key, longitudes[key], houseFor(longitudes[key], points.asc)));
  const houses = Array.from({ length: 12 }, (_, i) => norm((points.asc ?? 0) + i * 30));
  return {
    input,
    julianDay,
    planets,
    houses,
    aspects: findAspects(planets),
    ascendant: points.asc === undefined ? undefined : { ...body("ascendant", points.asc, 1), name: "ASC" },
    midheaven: points.mc === undefined ? undefined : { ...body("midheaven", points.mc), name: "MC" }
  };
}

export function calculateTransits(natalChart: Chart, date = new Date()): TransitSnapshot {
  const transitInput = chartInputFromDate(natalChart.input, date);
  const transitChart = calculateChart(transitInput);
  return {
    dateLabel: `${transitInput.date} ${transitInput.time}`,
    chart: transitChart,
    aspects: findTransitAspects(transitChart.planets, natalChart.planets)
  };
}

export function formatPosition(position: BodyPosition) {
  return `${position.name}: ${position.sign.name}${position.degree.toFixed(1)}度${position.house ? ` / ${position.house}ハウス` : ""}`;
}
