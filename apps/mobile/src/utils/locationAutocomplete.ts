export interface LocationSuggestion {
  id: string;
  name: string;
  displayText: string;
  type: "country" | "state" | "city";
  district?: string;
  state?: string;
  country?: string;
}

const CITIES: LocationSuggestion[] = [
  {
    id: "1",
    name: "Mumbai",
    displayText: "Mumbai, Maharashtra, India",
    type: "city",
    state: "Maharashtra",
    country: "India",
  },
  {
    id: "2",
    name: "Delhi",
    displayText: "New Delhi, Delhi, India",
    type: "city",
    state: "Delhi",
    country: "India",
  },
  {
    id: "3",
    name: "Bengaluru",
    displayText: "Bengaluru, Karnataka, India",
    type: "city",
    state: "Karnataka",
    country: "India",
  },
  {
    id: "4",
    name: "Hyderabad",
    displayText: "Hyderabad, Telangana, India",
    type: "city",
    state: "Telangana",
    country: "India",
  },
  {
    id: "5",
    name: "Chennai",
    displayText: "Chennai, Tamil Nadu, India",
    type: "city",
    state: "Tamil Nadu",
    country: "India",
  },
  {
    id: "6",
    name: "San Francisco",
    displayText: "San Francisco, CA, United States",
    type: "city",
    state: "California",
    country: "United States",
  },
  {
    id: "7",
    name: "New York",
    displayText: "New York, NY, United States",
    type: "city",
    state: "New York",
    country: "United States",
  },
  {
    id: "8",
    name: "London",
    displayText: "London, England, United Kingdom",
    type: "city",
    state: "England",
    country: "United Kingdom",
  },
  {
    id: "9",
    name: "Toronto",
    displayText: "Toronto, ON, Canada",
    type: "city",
    state: "Ontario",
    country: "Canada",
  },
  {
    id: "10",
    name: "Sydney",
    displayText: "Sydney, NSW, Australia",
    type: "city",
    state: "New South Wales",
    country: "Australia",
  },
];

export function getLocationSuggestions(query: string): LocationSuggestion[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return CITIES.filter((c) => c.displayText.toLowerCase().includes(q));
}
