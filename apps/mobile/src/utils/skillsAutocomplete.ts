export interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
}

const skillSuggestions: SkillSuggestion[] = [
  { id: "1", name: "React", category: "Frontend" },
  { id: "2", name: "React Native", category: "Mobile" },
  { id: "3", name: "TypeScript", category: "Languages" },
  { id: "4", name: "JavaScript", category: "Languages" },
  { id: "5", name: "Python", category: "Languages" },
  { id: "6", name: "Node.js", category: "Backend" },
  { id: "7", name: "HTML & CSS", category: "Frontend" },
  { id: "8", name: "SQL", category: "Databases" },
  { id: "9", name: "Git", category: "Tools" },
  { id: "10", name: "Project Management", category: "Soft Skills" },
];

export function getSkillSuggestions(query: string): SkillSuggestion[] {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase();
  return skillSuggestions.filter((s) => s.name.toLowerCase().includes(lowercaseQuery));
}
