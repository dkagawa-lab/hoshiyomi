export type WorldCity = {
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  aliases?: string[];
};

export type CountryLocations = {
  country: string;
  cities: WorldCity[];
};

export const worldLocations: CountryLocations[] = [
  {
    country: "United States",
    cities: [
      { name: "New York", region: "New York", latitude: 40.7128, longitude: -74.006, aliases: ["NYC", "New York City"] },
      { name: "Los Angeles", region: "California", latitude: 34.0522, longitude: -118.2437, aliases: ["LA"] },
      { name: "Chicago", region: "Illinois", latitude: 41.8781, longitude: -87.6298 },
      { name: "Houston", region: "Texas", latitude: 29.7604, longitude: -95.3698 },
      { name: "Phoenix", region: "Arizona", latitude: 33.4484, longitude: -112.074 },
      { name: "Philadelphia", region: "Pennsylvania", latitude: 39.9526, longitude: -75.1652 },
      { name: "San Antonio", region: "Texas", latitude: 29.4241, longitude: -98.4936 },
      { name: "San Diego", region: "California", latitude: 32.7157, longitude: -117.1611 },
      { name: "Dallas", region: "Texas", latitude: 32.7767, longitude: -96.797 },
      { name: "San Jose", region: "California", latitude: 37.3382, longitude: -121.8863 },
      { name: "Austin", region: "Texas", latitude: 30.2672, longitude: -97.7431 },
      { name: "Seattle", region: "Washington", latitude: 47.6062, longitude: -122.3321 },
      { name: "San Francisco", region: "California", latitude: 37.7749, longitude: -122.4194 },
      { name: "Boston", region: "Massachusetts", latitude: 42.3601, longitude: -71.0589 },
      { name: "Washington", region: "District of Columbia", latitude: 38.9072, longitude: -77.0369, aliases: ["Washington DC", "DC"] },
      { name: "Miami", region: "Florida", latitude: 25.7617, longitude: -80.1918 },
      { name: "Atlanta", region: "Georgia", latitude: 33.749, longitude: -84.388 },
      { name: "Denver", region: "Colorado", latitude: 39.7392, longitude: -104.9903 },
      { name: "Las Vegas", region: "Nevada", latitude: 36.1699, longitude: -115.1398 },
      { name: "Portland", region: "Oregon", latitude: 45.5152, longitude: -122.6784 },
      { name: "Nashville", region: "Tennessee", latitude: 36.1627, longitude: -86.7816 },
      { name: "New Orleans", region: "Louisiana", latitude: 29.9511, longitude: -90.0715 },
      { name: "Honolulu", region: "Hawaii", latitude: 21.3069, longitude: -157.8583 },
      { name: "Anchorage", region: "Alaska", latitude: 61.2181, longitude: -149.9003 }
    ]
  },
  {
    country: "Canada",
    cities: [
      { name: "Toronto", region: "Ontario", latitude: 43.6532, longitude: -79.3832 },
      { name: "Montreal", region: "Quebec", latitude: 45.5017, longitude: -73.5673 },
      { name: "Vancouver", region: "British Columbia", latitude: 49.2827, longitude: -123.1207 },
      { name: "Calgary", region: "Alberta", latitude: 51.0447, longitude: -114.0719 },
      { name: "Ottawa", region: "Ontario", latitude: 45.4215, longitude: -75.6972 },
      { name: "Edmonton", region: "Alberta", latitude: 53.5461, longitude: -113.4938 },
      { name: "Quebec City", region: "Quebec", latitude: 46.8139, longitude: -71.208 },
      { name: "Winnipeg", region: "Manitoba", latitude: 49.8951, longitude: -97.1384 }
    ]
  },
  {
    country: "Mexico",
    cities: [
      { name: "Mexico City", latitude: 19.4326, longitude: -99.1332, aliases: ["CDMX"] },
      { name: "Guadalajara", latitude: 20.6597, longitude: -103.3496 },
      { name: "Monterrey", latitude: 25.6866, longitude: -100.3161 },
      { name: "Tijuana", latitude: 32.5149, longitude: -117.0382 },
      { name: "Cancun", latitude: 21.1619, longitude: -86.8515 },
      { name: "Puebla", latitude: 19.0414, longitude: -98.2063 }
    ]
  },
  {
    country: "Brazil",
    cities: [
      { name: "Sao Paulo", latitude: -23.5558, longitude: -46.6396, aliases: ["São Paulo"] },
      { name: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
      { name: "Brasilia", latitude: -15.7939, longitude: -47.8828, aliases: ["Brasília"] },
      { name: "Salvador", latitude: -12.9777, longitude: -38.5016 }
    ]
  },
  {
    country: "Argentina",
    cities: [
      { name: "Buenos Aires", latitude: -34.6037, longitude: -58.3816 },
      { name: "Cordoba", latitude: -31.4201, longitude: -64.1888, aliases: ["Córdoba"] }
    ]
  },
  {
    country: "Chile",
    cities: [{ name: "Santiago", latitude: -33.4489, longitude: -70.6693 }]
  },
  {
    country: "Peru",
    cities: [{ name: "Lima", latitude: -12.0464, longitude: -77.0428 }]
  },
  {
    country: "Colombia",
    cities: [
      { name: "Bogota", latitude: 4.711, longitude: -74.0721, aliases: ["Bogotá"] },
      { name: "Medellin", latitude: 6.2442, longitude: -75.5812, aliases: ["Medellín"] }
    ]
  },
  {
    country: "United Kingdom",
    cities: [
      { name: "London", region: "England", latitude: 51.5072, longitude: -0.1276 },
      { name: "Manchester", region: "England", latitude: 53.4808, longitude: -2.2426 },
      { name: "Edinburgh", region: "Scotland", latitude: 55.9533, longitude: -3.1883 }
    ]
  },
  {
    country: "Ireland",
    cities: [{ name: "Dublin", latitude: 53.3498, longitude: -6.2603 }]
  },
  {
    country: "France",
    cities: [
      { name: "Paris", latitude: 48.8566, longitude: 2.3522 },
      { name: "Marseille", latitude: 43.2965, longitude: 5.3698 },
      { name: "Lyon", latitude: 45.764, longitude: 4.8357 }
    ]
  },
  {
    country: "Germany",
    cities: [
      { name: "Berlin", latitude: 52.52, longitude: 13.405 },
      { name: "Munich", latitude: 48.1351, longitude: 11.582, aliases: ["Muenchen", "München"] },
      { name: "Hamburg", latitude: 53.5511, longitude: 9.9937 },
      { name: "Frankfurt", latitude: 50.1109, longitude: 8.6821 }
    ]
  },
  {
    country: "Italy",
    cities: [
      { name: "Rome", latitude: 41.9028, longitude: 12.4964 },
      { name: "Milan", latitude: 45.4642, longitude: 9.19 },
      { name: "Naples", latitude: 40.8518, longitude: 14.2681 }
    ]
  },
  {
    country: "Spain",
    cities: [
      { name: "Madrid", latitude: 40.4168, longitude: -3.7038 },
      { name: "Barcelona", latitude: 41.3874, longitude: 2.1686 },
      { name: "Valencia", latitude: 39.4699, longitude: -0.3763 }
    ]
  },
  {
    country: "Portugal",
    cities: [
      { name: "Lisbon", latitude: 38.7223, longitude: -9.1393 },
      { name: "Porto", latitude: 41.1579, longitude: -8.6291 }
    ]
  },
  {
    country: "Netherlands",
    cities: [
      { name: "Amsterdam", latitude: 52.3676, longitude: 4.9041 },
      { name: "Rotterdam", latitude: 51.9244, longitude: 4.4777 }
    ]
  },
  {
    country: "Belgium",
    cities: [{ name: "Brussels", latitude: 50.8503, longitude: 4.3517 }]
  },
  {
    country: "Switzerland",
    cities: [
      { name: "Zurich", latitude: 47.3769, longitude: 8.5417 },
      { name: "Geneva", latitude: 46.2044, longitude: 6.1432 }
    ]
  },
  {
    country: "Austria",
    cities: [{ name: "Vienna", latitude: 48.2082, longitude: 16.3738 }]
  },
  {
    country: "Czech Republic",
    cities: [{ name: "Prague", latitude: 50.0755, longitude: 14.4378 }]
  },
  {
    country: "Poland",
    cities: [
      { name: "Warsaw", latitude: 52.2297, longitude: 21.0122 },
      { name: "Krakow", latitude: 50.0647, longitude: 19.945, aliases: ["Kraków"] }
    ]
  },
  {
    country: "Hungary",
    cities: [{ name: "Budapest", latitude: 47.4979, longitude: 19.0402 }]
  },
  {
    country: "Denmark",
    cities: [{ name: "Copenhagen", latitude: 55.6761, longitude: 12.5683 }]
  },
  {
    country: "Sweden",
    cities: [{ name: "Stockholm", latitude: 59.3293, longitude: 18.0686 }]
  },
  {
    country: "Norway",
    cities: [{ name: "Oslo", latitude: 59.9139, longitude: 10.7522 }]
  },
  {
    country: "Finland",
    cities: [{ name: "Helsinki", latitude: 60.1699, longitude: 24.9384 }]
  },
  {
    country: "Iceland",
    cities: [{ name: "Reykjavik", latitude: 64.1466, longitude: -21.9426, aliases: ["Reykjavík"] }]
  },
  {
    country: "Greece",
    cities: [{ name: "Athens", latitude: 37.9838, longitude: 23.7275 }]
  },
  {
    country: "Turkey",
    cities: [
      { name: "Istanbul", latitude: 41.0082, longitude: 28.9784 },
      { name: "Ankara", latitude: 39.9334, longitude: 32.8597 }
    ]
  },
  {
    country: "Japan",
    cities: [
      { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 },
      { name: "Osaka", latitude: 34.6937, longitude: 135.5023 },
      { name: "Kyoto", latitude: 35.0116, longitude: 135.7681 },
      { name: "Sapporo", latitude: 43.0618, longitude: 141.3545 },
      { name: "Fukuoka", latitude: 33.5902, longitude: 130.4017 }
    ]
  },
  {
    country: "South Korea",
    cities: [
      { name: "Seoul", latitude: 37.5665, longitude: 126.978 },
      { name: "Busan", latitude: 35.1796, longitude: 129.0756 }
    ]
  },
  {
    country: "China",
    cities: [
      { name: "Beijing", latitude: 39.9042, longitude: 116.4074 },
      { name: "Shanghai", latitude: 31.2304, longitude: 121.4737 },
      { name: "Guangzhou", latitude: 23.1291, longitude: 113.2644 },
      { name: "Shenzhen", latitude: 22.5431, longitude: 114.0579 }
    ]
  },
  {
    country: "Hong Kong",
    cities: [{ name: "Hong Kong", latitude: 22.3193, longitude: 114.1694 }]
  },
  {
    country: "Taiwan",
    cities: [{ name: "Taipei", latitude: 25.033, longitude: 121.5654 }]
  },
  {
    country: "Singapore",
    cities: [{ name: "Singapore", latitude: 1.3521, longitude: 103.8198 }]
  },
  {
    country: "Thailand",
    cities: [
      { name: "Bangkok", latitude: 13.7563, longitude: 100.5018 },
      { name: "Chiang Mai", latitude: 18.7883, longitude: 98.9853 }
    ]
  },
  {
    country: "Malaysia",
    cities: [{ name: "Kuala Lumpur", latitude: 3.139, longitude: 101.6869 }]
  },
  {
    country: "Indonesia",
    cities: [{ name: "Jakarta", latitude: -6.2088, longitude: 106.8456 }]
  },
  {
    country: "Philippines",
    cities: [{ name: "Manila", latitude: 14.5995, longitude: 120.9842 }]
  },
  {
    country: "Vietnam",
    cities: [
      { name: "Ho Chi Minh City", latitude: 10.8231, longitude: 106.6297, aliases: ["Saigon"] },
      { name: "Hanoi", latitude: 21.0278, longitude: 105.8342 }
    ]
  },
  {
    country: "India",
    cities: [
      { name: "New Delhi", latitude: 28.6139, longitude: 77.209 },
      { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
      { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946, aliases: ["Bangalore"] },
      { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
      { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
      { name: "Hyderabad", latitude: 17.385, longitude: 78.4867 }
    ]
  },
  {
    country: "Pakistan",
    cities: [
      { name: "Karachi", latitude: 24.8607, longitude: 67.0011 },
      { name: "Lahore", latitude: 31.5204, longitude: 74.3587 },
      { name: "Islamabad", latitude: 33.6844, longitude: 73.0479 }
    ]
  },
  {
    country: "Bangladesh",
    cities: [{ name: "Dhaka", latitude: 23.8103, longitude: 90.4125 }]
  },
  {
    country: "Nepal",
    cities: [{ name: "Kathmandu", latitude: 27.7172, longitude: 85.324 }]
  },
  {
    country: "Sri Lanka",
    cities: [{ name: "Colombo", latitude: 6.9271, longitude: 79.8612 }]
  },
  {
    country: "United Arab Emirates",
    cities: [
      { name: "Dubai", latitude: 25.2048, longitude: 55.2708 },
      { name: "Abu Dhabi", latitude: 24.4539, longitude: 54.3773 }
    ]
  },
  {
    country: "Qatar",
    cities: [{ name: "Doha", latitude: 25.2854, longitude: 51.531 }]
  },
  {
    country: "Saudi Arabia",
    cities: [
      { name: "Riyadh", latitude: 24.7136, longitude: 46.6753 },
      { name: "Jeddah", latitude: 21.4858, longitude: 39.1925 }
    ]
  },
  {
    country: "Israel",
    cities: [
      { name: "Tel Aviv", latitude: 32.0853, longitude: 34.7818 },
      { name: "Jerusalem", latitude: 31.7683, longitude: 35.2137 }
    ]
  },
  {
    country: "Egypt",
    cities: [
      { name: "Cairo", latitude: 30.0444, longitude: 31.2357 },
      { name: "Alexandria", latitude: 31.2001, longitude: 29.9187 }
    ]
  },
  {
    country: "Nigeria",
    cities: [
      { name: "Lagos", latitude: 6.5244, longitude: 3.3792 },
      { name: "Abuja", latitude: 9.0765, longitude: 7.3986 }
    ]
  },
  {
    country: "Kenya",
    cities: [{ name: "Nairobi", latitude: -1.2921, longitude: 36.8219 }]
  },
  {
    country: "South Africa",
    cities: [
      { name: "Cape Town", latitude: -33.9249, longitude: 18.4241 },
      { name: "Johannesburg", latitude: -26.2041, longitude: 28.0473 },
      { name: "Durban", latitude: -29.8587, longitude: 31.0218 }
    ]
  },
  {
    country: "Morocco",
    cities: [
      { name: "Casablanca", latitude: 33.5731, longitude: -7.5898 },
      { name: "Marrakech", latitude: 31.6295, longitude: -7.9811 }
    ]
  },
  {
    country: "Australia",
    cities: [
      { name: "Sydney", latitude: -33.8688, longitude: 151.2093 },
      { name: "Melbourne", latitude: -37.8136, longitude: 144.9631 },
      { name: "Brisbane", latitude: -27.4698, longitude: 153.0251 },
      { name: "Perth", latitude: -31.9523, longitude: 115.8613 },
      { name: "Adelaide", latitude: -34.9285, longitude: 138.6007 }
    ]
  },
  {
    country: "New Zealand",
    cities: [
      { name: "Auckland", latitude: -36.8509, longitude: 174.7645 },
      { name: "Wellington", latitude: -41.2865, longitude: 174.7762 },
      { name: "Christchurch", latitude: -43.5321, longitude: 172.6362 }
    ]
  }
];

export function findWorldLocation(country: string, city: string) {
  const location = worldLocations.find((item) => item.country === country) ?? worldLocations[0];
  const selectedCity = location.cities.find((item) => item.name === city) ?? location.cities[0];
  return { location, city: selectedCity };
}
