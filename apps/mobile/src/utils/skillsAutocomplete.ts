export interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
}

const COMMON_SKILLS: SkillSuggestion[] = [
  { id: "1", name: "JavaScript", category: "Programming Languages" },
  { id: "2", name: "TypeScript", category: "Programming Languages" },
  { id: "3", name: "Python", category: "Programming Languages" },
  { id: "4", name: "Java", category: "Programming Languages" },
  { id: "5", name: "C++", category: "Programming Languages" },
  { id: "6", name: "C#", category: "Programming Languages" },
  { id: "7", name: "Go", category: "Programming Languages" },
  { id: "8", name: "Rust", category: "Programming Languages" },
  { id: "9", name: "HTML5", category: "Web Technologies" },
  { id: "10", name: "CSS3", category: "Web Technologies" },
  { id: "11", name: "React.js", category: "Web Frameworks" },
  { id: "12", name: "React Native", category: "Mobile Development" },
  { id: "13", name: "Node.js", category: "Backend Frameworks" },
  { id: "14", name: "Express.js", category: "Backend Frameworks" },
  { id: "15", name: "Next.js", category: "Web Frameworks" },
  { id: "16", name: "Vue.js", category: "Web Frameworks" },
  { id: "17", name: "Angular", category: "Web Frameworks" },
  { id: "18", name: "Django", category: "Backend Frameworks" },
  { id: "19", name: "Flask", category: "Backend Frameworks" },
  { id: "20", name: "FastAPI", category: "Backend Frameworks" },
  { id: "21", name: "Spring Boot", category: "Backend Frameworks" },
  { id: "22", name: "SQL", category: "Databases" },
  { id: "23", name: "PostgreSQL", category: "Databases" },
  { id: "24", name: "MySQL", category: "Databases" },
  { id: "25", name: "MongoDB", category: "Databases" },
  { id: "26", name: "Redis", category: "Databases" },
  { id: "27", name: "GraphQL", category: "API Technologies" },
  { id: "28", name: "REST API", category: "API Technologies" },
  { id: "29", name: "Docker", category: "DevOps & Cloud" },
  { id: "30", name: "Kubernetes", category: "DevOps & Cloud" },
  { id: "31", name: "AWS", category: "DevOps & Cloud" },
  { id: "32", name: "Google Cloud Platform (GCP)", category: "DevOps & Cloud" },
  { id: "33", name: "Microsoft Azure", category: "DevOps & Cloud" },
  { id: "34", name: "CI/CD", category: "DevOps & Cloud" },
  { id: "35", name: "Git", category: "Version Control" },
  { id: "36", name: "GitHub", category: "Version Control" },
  { id: "37", name: "GitLab", category: "Version Control" },
  { id: "38", name: "Agile Methodologies", category: "Project Management" },
  { id: "39", name: "Scrum", category: "Project Management" },
  { id: "40", name: "Kanban", category: "Project Management" },
  { id: "41", name: "Jira", category: "Project Management" },
  { id: "42", name: "Confluence", category: "Project Management" },
  { id: "43", name: "Figma", category: "Design" },
  { id: "44", name: "UI/UX Design", category: "Design" },
  { id: "45", name: "Linux", category: "Operating Systems" },
  { id: "46", name: "Bash Scripting", category: "Operating Systems" },
  { id: "47", name: "Machine Learning", category: "AI & Data Science" },
  { id: "48", name: "Deep Learning", category: "AI & Data Science" },
  { id: "49", name: "Data Analysis", category: "AI & Data Science" },
  { id: "50", name: "PyTorch", category: "AI & Data Science" },
  { id: "51", name: "TensorFlow", category: "AI & Data Science" },
  { id: "52", name: "Cybersecurity", category: "Security" },
  { id: "53", name: "Communication", category: "Soft Skills" },
  { id: "54", name: "Team Leadership", category: "Soft Skills" },
  { id: "55", name: "Problem Solving", category: "Soft Skills" },
];

export function getSkillSuggestions(query: string): SkillSuggestion[] {
  if (!query || !query.trim()) return [];
  const normalized = query.trim().toLowerCase();
  return COMMON_SKILLS.filter(
    (skill) =>
      skill.name.toLowerCase().includes(normalized) ||
      skill.category.toLowerCase().includes(normalized),
  ).slice(0, 5);
}
