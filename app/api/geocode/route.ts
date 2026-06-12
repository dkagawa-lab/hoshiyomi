import { NextResponse } from "next/server";

type OpenMeteoResult = {
  admin1?: string;
  admin2?: string;
  country?: string;
  country_code?: string;
  id?: number;
  latitude?: number;
  longitude?: number;
  name?: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = cleanQuery(url.searchParams.get("query"));
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  searchUrl.searchParams.set("name", query);
  searchUrl.searchParams.set("count", "20");
  searchUrl.searchParams.set("language", "en");
  searchUrl.searchParams.set("format", "json");

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "accept": "application/json"
      },
      next: { revalidate: 86400 }
    });
    if (!response.ok) {
      return NextResponse.json({ error: "City search failed.", results: [] }, { status: 502 });
    }
    const data = (await response.json()) as OpenMeteoResponse;
    const results = (data.results ?? [])
      .filter((item) => typeof item.name === "string" && typeof item.country === "string" && typeof item.latitude === "number" && typeof item.longitude === "number")
      .map((item) => {
        const regionParts = [item.admin2, item.admin1, item.country].filter(Boolean);
        return {
          country: item.country,
          id: item.id ? String(item.id) : `${item.name}-${item.country}-${item.latitude}-${item.longitude}`,
          label: `${item.name}, ${item.country}`,
          latitude: item.latitude,
          longitude: item.longitude,
          name: item.name,
          region: regionParts.join(", "),
          subtitle: regionParts.join(", ")
        };
      });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "City search is temporarily unavailable.", results: [] }, { status: 502 });
  }
}

function cleanQuery(value: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}
