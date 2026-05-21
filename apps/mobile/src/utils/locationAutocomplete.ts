export interface LocationSuggestion {
  id: string;
  name: string;
  type: "country" | "state" | "city";
  district?: string;
  state?: string;
  country?: string;
  displayText: string;
}

const locations: LocationSuggestion[] = [
  { id: "1", name: "Mumbai", type: "city", state: "Maharashtra", country: "India", displayText: "Mumbai, Maharashtra, India" },
  { id: "2", name: "Delhi", type: "city", state: "Delhi", country: "India", displayText: "Delhi, India" },
  { id: "3", name: "Bengaluru", type: "city", state: "Karnataka", country: "India", displayText: "Bengaluru, Karnataka, India" },
  { id: "4", name: "Hyderabad", type: "city", state: "Telangana", country: "India", displayText: "Hyderabad, Telangana, India" },
  { id: "5", name: "Chennai", type: "city", state: "Tamil Nadu", country: "India", displayText: "Chennai, Tamil Nadu, India" },
  { id: "6", name: "Kolkata", type: "city", state: "West Bengal", country: "India", displayText: "Kolkata, West Bengal, India" },
  { id: "7", name: "Pune", type: "city", state: "Maharashtra", country: "India", displayText: "Pune, Maharashtra, India" },
  { id: "8", name: "New York", type: "city", country: "United States", displayText: "New York, NY, United States" },
  { id: "9", name: "London", type: "city", country: "United Kingdom", displayText: "London, United Kingdom" },
  { id: "10", name: "Singapore", type: "country", displayText: "Singapore" },
];

export function getLocationSuggestions(query: string): LocationSuggestion[] {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase();
  return locations.filter((loc) =>
    loc.name.toLowerCase().includes(lowercaseQuery) ||
    loc.displayText.toLowerCase().includes(lowercaseQuery)
  );
}
